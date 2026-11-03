import type { StatusTone } from '../../../shared/ui/StatusPill';

export type PaymentStatus = 'Pagado' | 'En verificación' | 'Monto por revisar' | 'Rechazado' | 'Expirado';

export interface Payment {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** Nombre del alumno, o su correo si no tiene. null si no se encontró su perfil. */
  studentName: string | null;
  studentTaxId: string | null;
  planName: string;
  method: string | null;
  status: PaymentStatus;
  /** Dinero siempre en céntimos enteros. */
  amountUsdCents: number;
  /** ISO en UTC. null mientras no esté confirmado. */
  paidAt: string | null;
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  Pagado: 'success',
  'En verificación': 'warning',
  'Monto por revisar': 'warning',
  Rechazado: 'danger',
  Expirado: 'neutral',
};

export interface PaymentEvent {
  /** ISO en UTC; se muestra en hora de Caracas. */
  at: string;
  label: string;
  /** Quién lo hizo, si fue una persona (admin o alumno). */
  by?: string;
  /** Motivo que escribió el admin, o detalle del evento. */
  note?: string;
}

export interface PaymentDetail extends Payment {
  studentEmail: string | null;
  amountBsCents: number | null;
  /** Bs por USD usada para cobrar. */
  rate: number | null;
  /** La que escribió el alumno al reportar. */
  reference: string | null;
  /** ISO en UTC. */
  createdAt: string;
  /** Ruta en el bucket privado "receipts". Solo en pagos reportados a mano. */
  receiptPath: string | null;
  events: PaymentEvent[];
}

/** $29,00 — USD desde céntimos. */
export function formatUsd(cents: number) {
  return `$${(cents / 100).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Bs. 6.245,73 — bolívares desde céntimos. */
export function formatBs(cents: number) {
  return `Bs. ${(cents / 100).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Fecha y hora en Caracas, desde un ISO en UTC. */
export function formatDateTimeCaracas(iso: string) {
  return new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}
