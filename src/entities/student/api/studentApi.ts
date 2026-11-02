import { caracasDay, daysUntil } from '../../membership';
import { supabase } from '../../../shared/lib/supabaseClient';
import type { Student, StudentStatus } from '../model/students';

const DAY_MS = 86_400_000;
const EXPIRING_SOON_DAYS = 3;

interface EntitlementRow {
  user_id: string;
  status: string;
  expires_at: string;
  plans: { name: string; grace_days: number };
}

function statusOf(entitlement: EntitlementRow): StudentStatus {
  if (entitlement.status === 'revoked') return 'Acceso quitado';
  const expiry = new Date(entitlement.expires_at).getTime();
  const now = Date.now();
  if (now < expiry) return daysUntil(caracasDay(entitlement.expires_at)) <= EXPIRING_SOON_DAYS ? 'Por vencer' : 'Activa';
  return now < expiry + entitlement.plans.grace_days * DAY_MS ? 'En gracia' : 'Vencida';
}

/**
 * Todas las cuentas registradas con su suscripción. Solo un admin las recibe todas: RLS le
 * devuelve a cualquier otro únicamente la suya. profiles y entitlements no tienen relación
 * directa en la BD (ambas apuntan a auth.users), por eso son dos consultas.
 */
export async function fetchStudents(): Promise<Student[]> {
  if (!supabase) return [];
  const [profiles, entitlements] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, tax_id').order('created_at', { ascending: false }),
    supabase
      .from('entitlements')
      .select('user_id, status, expires_at, plans!inner(name, kind, grace_days)')
      .eq('plans.kind', 'subscription')
      .not('expires_at', 'is', null),
  ]);
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
      planName: entitlement?.plans.name ?? null,
      expiresOn: entitlement ? caracasDay(entitlement.expires_at) : null,
      status: entitlement ? statusOf(entitlement) : 'Sin plan',
    };
  });
}
