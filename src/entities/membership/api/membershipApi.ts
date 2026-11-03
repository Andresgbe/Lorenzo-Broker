import { supabase } from '../../../shared/lib/supabaseClient';
import type { UserMembership } from '../model/membership';

const DAY_MS = 86_400_000;

/**
 * La suscripción del usuario, o null si nunca tuvo una o se la revocaron.
 * Filtra por user_id porque RLS le devuelve a un admin las de todos.
 * Es para mostrar: el acceso real lo decide el servidor con estas mismas fechas.
 */
export async function fetchMembership(userId: string): Promise<UserMembership | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('entitlements')
    .select('plan_id, status, expires_at, plans!inner(name, kind, duration_days, grace_days)')
    .eq('user_id', userId)
    .eq('plans.kind', 'subscription')
    .neq('status', 'revoked')
    .not('expires_at', 'is', null)
    .order('expires_at', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);

  const row = data?.[0];
  if (!row) return null;
  const plan = row.plans as unknown as { name: string; duration_days: number; grace_days: number };
  const expiresAt = row.expires_at as string;
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();

  return {
    planId: row.plan_id as string,
    planName: plan.name,
    durationDays: plan.duration_days,
    expiresAt,
    // Expirada por un admin: sin días de gracia, aunque por fecha aún los tendría.
    status: row.status === 'ended' ? 'expired' : now < expiry ? 'active' : now < expiry + plan.grace_days * DAY_MS ? 'grace' : 'expired',
  };
}
