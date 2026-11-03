import { caracasDay, daysUntil } from '../../membership';
import { supabase } from '../../../shared/lib/supabaseClient';
import type { Student, StudentAction, StudentRole, StudentStatus } from '../model/students';

const DAY_MS = 86_400_000;
const EXPIRING_SOON_DAYS = 3;

interface EntitlementRow {
  user_id: string;
  plan_id: string;
  status: string;
  expires_at: string;
  plans: { name: string; grace_days: number };
}

function statusOf(entitlement: EntitlementRow): StudentStatus {
  if (entitlement.status === 'revoked') return 'Acceso quitado';
  if (entitlement.status === 'ended') return 'Expirada';
  const expiry = new Date(entitlement.expires_at).getTime();
  const now = Date.now();
  if (now < expiry) return daysUntil(caracasDay(entitlement.expires_at)) <= EXPIRING_SOON_DAYS ? 'Por vencer' : 'Activa';
  return now < expiry + entitlement.plans.grace_days * DAY_MS ? 'En gracia' : 'Vencida';
}

/**
 * Las cuentas registradas con su suscripción, o solo una si se pasa userId. Solo un admin las
 * recibe todas: RLS le devuelve a cualquier otro únicamente la suya. profiles y entitlements no
 * tienen relación directa en la BD (ambas apuntan a auth.users), por eso son dos consultas.
 * profiles con '*': role llega con la migración 0007 y sin ella la lista debe seguir cargando.
 */
export async function fetchStudents(userId?: string): Promise<Student[]> {
  if (!supabase) return [];
  let profilesQuery = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  let entitlementsQuery = supabase
    .from('entitlements')
    .select('user_id, plan_id, status, expires_at, plans!inner(name, kind, grace_days)')
    .eq('plans.kind', 'subscription')
    .not('expires_at', 'is', null);
  if (userId) {
    profilesQuery = profilesQuery.eq('id', userId);
    entitlementsQuery = entitlementsQuery.eq('user_id', userId);
  }
  const [profiles, entitlements] = await Promise.all([profilesQuery, entitlementsQuery]);
  if (profiles.error) throw new Error(profiles.error.message);
  if (entitlements.error) throw new Error(entitlements.error.message);

  // Por usuario, una sola: la vigente que venza más tarde; una revocada solo si no tiene otra.
  const byUser = new Map<string, EntitlementRow>();
  for (const row of (entitlements.data ?? []) as unknown as EntitlementRow[]) {
    const current = byUser.get(row.user_id);
    const isRevoked = row.status === 'revoked';
    const isBetter =
      !current ||
      (current.status === 'revoked' && !isRevoked) ||
      ((current.status === 'revoked') === isRevoked && new Date(row.expires_at) > new Date(current.expires_at));
    if (isBetter) byUser.set(row.user_id, row);
  }

  return (profiles.data ?? []).map((profile) => {
    const entitlement = byUser.get(profile.id as string);
    return {
      id: profile.id as string,
      name: (profile.full_name as string | null) || null,
      email: profile.email as string,
      taxId: (profile.tax_id as string | null) || null,
      phone: (profile.phone as string | null) || null,
      role: ((profile.role as StudentRole | undefined) ?? 'student'),
      planId: entitlement?.plan_id ?? null,
      planName: entitlement?.plans.name ?? null,
      expiresOn: entitlement ? caracasDay(entitlement.expires_at) : null,
      status: entitlement ? statusOf(entitlement) : 'Sin plan',
    };
  });
}

/** Lo que los administradores han hecho con esta cuenta, lo más reciente primero. */
export async function fetchStudentActions(userId: string): Promise<StudentAction[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('admin_actions')
    .select('id, admin_id, action, reason, details, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const adminIds = [...new Set(rows.map((row) => row.admin_id as string | null).filter((id): id is string => id !== null))];
  const admins = new Map<string, string>();
  if (adminIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name, email').in('id', adminIds);
    if (profilesError) throw new Error(profilesError.message);
    for (const profile of profiles ?? []) admins.set(profile.id as string, (profile.full_name as string | null) || (profile.email as string));
  }

  return rows.map((row) => ({
    id: row.id as string,
    action: row.action as string,
    reason: row.reason as string,
    details: (row.details as Record<string, unknown> | null) ?? {},
    at: row.created_at as string,
    adminName: row.admin_id ? (admins.get(row.admin_id as string) ?? null) : null,
  }));
}

// Los errores que lanzan estas funciones de la BD ya vienen en español; el resto no se muestra tal cual.
async function callRpc(name: string, args: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { error } = await supabase.rpc(name, args);
  if (!error) return;
  if (error.code === 'PGRST202') throw new Error('Falta aplicar una migración en Supabase (0007 o 0013).');
  if (error.code === 'P0001' || error.code === '42501') throw new Error(error.message);
  throw new Error('No se pudo guardar. Intenta de nuevo en un momento.');
}

export const grantAccess = (userId: string, planId: string, days: number, reason: string) =>
  callRpc('admin_grant_access', { p_user_id: userId, p_plan_id: planId, p_days: days, p_reason: reason });

export const revokeAccess = (userId: string, planId: string, reason: string) =>
  callRpc('admin_revoke_access', { p_user_id: userId, p_plan_id: planId, p_reason: reason });

export const expireAccess = (userId: string, reason: string) =>
  callRpc('admin_expire_access', { p_user_id: userId, p_reason: reason });

export interface StudentDataInput {
  fullName: string;
  taxId: string;
  phone: string;
}

export const updateStudent = (userId: string, { fullName, taxId, phone }: StudentDataInput, reason: string) =>
  callRpc('admin_update_student', { p_user_id: userId, p_full_name: fullName, p_tax_id: taxId, p_phone: phone, p_reason: reason });

export interface RecordPaymentInput {
  planId: string;
  months: number;
  amountUsdCents: number;
  amountBsCents: number | null;
  method: string;
  reference: string;
}

export const recordPayment = (userId: string, input: RecordPaymentInput, reason: string) =>
  callRpc('admin_record_payment', {
    p_user_id: userId,
    p_plan_id: input.planId,
    p_months: input.months,
    p_amount_usd_cents: input.amountUsdCents,
    p_amount_bs_cents: input.amountBsCents,
    p_method: input.method,
    p_reference: input.reference,
    p_reason: reason,
  });
