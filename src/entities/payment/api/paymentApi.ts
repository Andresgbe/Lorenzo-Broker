import { caracasDay } from '../../membership';
import { findPaymentMethod } from '../../../shared/config/payment-methods';
import { supabase } from '../../../shared/lib/supabaseClient';
import type { Payment, PaymentDetail, PaymentEvent, PaymentStatus } from '../model/payments';

const STATUS_LABEL: Record<string, PaymentStatus> = {
  pending: 'En verificación',
  review: 'Monto por revisar',
  paid: 'Pagado',
  failed: 'Rechazado',
  expired: 'Expirado',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function methodLabel(method: string | null) {
  return method ? (findPaymentMethod(method)?.label ?? method) : null;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  tax_id: string | null;
}

// payments y profiles no tienen relación directa en la BD (ambas apuntan a auth.users).
async function fetchProfiles(userIds: string[]): Promise<Map<string, ProfileRow>> {
  if (!supabase || userIds.length === 0) return new Map();
  const { data, error } = await supabase.from('profiles').select('id, email, full_name, tax_id').in('id', [...new Set(userIds)]);
  if (error) throw new Error(error.message);
  return new Map(((data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
}

/** Todos los pagos, los más recientes primero. Solo un admin los recibe todos: lo garantiza RLS. */
export async function fetchPayments(): Promise<Payment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('payments')
    .select('id, user_id, status, amount_usd_cents, method, paid_at, created_at, plans(name)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const profiles = await fetchProfiles(rows.map((row) => row.user_id as string));
  return rows.map((row) => {
    const profile = profiles.get(row.user_id as string);
    return {
      id: row.id as string,
      date: caracasDay(row.created_at as string),
      studentName: profile?.full_name || profile?.email || null,
      studentTaxId: profile?.tax_id || null,
      planName: (row.plans as unknown as { name: string } | null)?.name ?? '—',
      method: methodLabel(row.method as string | null),
      status: STATUS_LABEL[row.status as string] ?? 'En verificación',
      amountUsdCents: row.amount_usd_cents as number,
      paidAt: row.paid_at as string | null,
    };
  });
}

/** Un pago con su alumno, su comprobante e historial. null si no existe o el enlace está mal. */
export async function fetchPaymentDetail(id: string): Promise<PaymentDetail | null> {
  if (!supabase || !UUID.test(id)) return null;
  const { data: row, error } = await supabase
    .from('payments')
    .select('id, user_id, status, amount_usd_cents, amount_bs_cents, exchange_rate, method, reference, paid_at, created_at, updated_at, plans(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return null;

  const [profiles, reports] = await Promise.all([
    fetchProfiles([row.user_id as string]),
    supabase.from('payment_reports').select('receipt_path, note, created_at').eq('payment_id', id).order('created_at', { ascending: false }).limit(1),
  ]);
  if (reports.error) throw new Error(reports.error.message);

  const profile = profiles.get(row.user_id as string);
  const report = reports.data?.[0];
  const createdAt = row.created_at as string;
  const method = methodLabel(row.method as string | null);
  const status = STATUS_LABEL[row.status as string] ?? 'En verificación';

  const events: PaymentEvent[] = [{ at: createdAt, label: 'Pago registrado' }];
  if (report) events.push({ at: report.created_at as string, label: 'El alumno reportó el pago', note: (report.note as string | null) ?? undefined });
  if (row.paid_at) events.push({ at: row.paid_at as string, label: 'Pago confirmado' });
  else if (status === 'Rechazado') events.push({ at: row.updated_at as string, label: 'Pago rechazado' });
  else if (status === 'Expirado') events.push({ at: row.updated_at as string, label: 'Pago expirado sin confirmarse' });

  return {
    id: row.id as string,
    date: caracasDay(createdAt),
    studentName: profile?.full_name || profile?.email || null,
    studentTaxId: profile?.tax_id || null,
    studentEmail: profile?.email ?? null,
    planName: (row.plans as unknown as { name: string } | null)?.name ?? '—',
    method,
    status,
    amountUsdCents: row.amount_usd_cents as number,
    paidAt: row.paid_at as string | null,
    amountBsCents: row.amount_bs_cents as number | null,
    rate: row.exchange_rate === null ? null : Number(row.exchange_rate),
    reference: row.reference as string | null,
    createdAt,
    receiptPath: (report?.receipt_path as string | undefined) ?? null,
    events,
  };
}

/** URL firmada de 5 minutos del comprobante, en el bucket privado. */
export async function getReceiptUrl(path: string): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
