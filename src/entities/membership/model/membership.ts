export type MembershipStatus = 'active' | 'expired';

export interface Membership {
  status: MembershipStatus;
  planName: string;
  /** ISO corta, YYYY-MM-DD. */
  expiresOn: string;
}

/**
 * Datos de ejemplo mientras no existan las tablas de suscripciones y pagos.
 * Reemplazar por la membresía real del usuario autenticado.
 */
export const DEMO_MEMBERSHIP: Membership = {
  status: 'active',
  planName: 'Mensual',
  expiresOn: '2026-11-08',
};

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

export function daysUntil(iso: string) {
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  const today = new Date().setUTCHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}
