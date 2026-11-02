export type MembershipStatus = 'active' | 'expired';

export interface Membership {
  status: MembershipStatus;
  planName: string;
  /** ISO corta, YYYY-MM-DD. */
  expiresOn: string;
}

/** La suscripción real del usuario. 'grace': ya venció, pero aún tiene acceso por los días de gracia. */
export interface UserMembership {
  planId: string;
  planName: string;
  durationDays: number;
  /** Timestamp UTC, como viene de Supabase. */
  expiresAt: string;
  status: 'active' | 'grace' | 'expired';
}

/** Para la pantalla de membresía vencida: misma forma, fecha ya pasada. */
export const DEMO_EXPIRED_MEMBERSHIP: Membership = {
  status: 'expired',
  planName: 'Mensual',
  expiresOn: '2026-09-30',
};

export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

/** El día (YYYY-MM-DD) en hora de Caracas: las fechas se guardan en UTC y se muestran así. */
export function caracasDay(date: Date | string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas' }).format(new Date(date));
}

export function daysUntil(iso: string) {
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  const today = new Date(`${caracasDay(new Date())}T00:00:00Z`).getTime();
  return Math.round((target - today) / 86_400_000);
}

/**
 * Hasta cuándo llegaría el acceso al pagar hoy. Misma regla que extend_entitlement en la BD:
 * si sigue vigente se suma a su vencimiento; si ya venció, desde hoy.
 */
export function renewalExpiresOn(membership: UserMembership, months: number) {
  const base = membership.status === 'active' ? new Date(membership.expiresAt).getTime() : Date.now();
  return caracasDay(new Date(base + months * membership.durationDays * 86_400_000));
}

/** "Vence el 08/11/2026 · 6 días restantes" y equivalentes, para Inicio y Mi cuenta. */
export function describeMembership(membership: UserMembership) {
  const expiresOn = caracasDay(membership.expiresAt);
  if (membership.status === 'expired') return `Venció el ${formatDate(expiresOn)}`;
  if (membership.status === 'grace') return `Venció el ${formatDate(expiresOn)}. Aún tienes acceso por unos días.`;
  const remaining = daysUntil(expiresOn);
  const left = remaining === 0 ? 'vence hoy' : remaining === 1 ? '1 día restante' : `${remaining} días restantes`;
  return `Vence el ${formatDate(expiresOn)} · ${left}`;
}
