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
  paidAt?: string | null;
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  Pagado: 'success',
  'En verificación': 'warning',
  'Monto por revisar': 'warning',
  Rechazado: 'danger',
  Expirado: 'neutral',
};

/** Datos de ejemplo que todavía usa el historial de Mi cuenta. El panel ya usa usePayments(). */
export const DEMO_PAYMENTS: Payment[] = [
  { id: 'pg-108', date: '2026-10-11', studentName: 'María Pérez', studentTaxId: 'V-12345678', planName: 'Mensual', method: 'PagoMóvil', status: 'En verificación', amountUsdCents: 2900 },
  { id: 'pg-107', date: '2026-10-11', studentName: 'José Rodríguez', studentTaxId: 'V-20811223', planName: 'Mensual', method: 'Transferencia', status: 'En verificación', amountUsdCents: 2900 },
  { id: 'pg-106', date: '2026-10-10', studentName: 'Andrea Molina', studentTaxId: 'V-18992341', planName: 'Mensual', method: 'Zelle', status: 'Pagado', amountUsdCents: 2900 },
  { id: 'pg-105', date: '2026-10-09', studentName: 'Carlos Lugo', studentTaxId: 'V-15340982', planName: 'Mensual', method: 'Binance Pay', status: 'Pagado', amountUsdCents: 2900 },
  { id: 'pg-104', date: '2026-10-08', studentName: 'Daniela Ruiz', studentTaxId: 'V-22104567', planName: 'Mensual', method: 'PagoMóvil', status: 'Pagado', amountUsdCents: 2900 },
  { id: 'pg-103', date: '2026-10-07', studentName: 'Luis Hernández', studentTaxId: 'V-17883420', planName: 'Mensual', method: 'Transferencia', status: 'Rechazado', amountUsdCents: 2900 },
  { id: 'pg-102', date: '2026-10-06', studentName: 'Patricia Gómez', studentTaxId: 'V-13550871', planName: 'Mensual', method: 'Zelle', status: 'Pagado', amountUsdCents: 2900 },
  { id: 'pg-101', date: '2026-10-05', studentName: 'Rafael Mendoza', studentTaxId: 'V-19220045', planName: 'Mensual', method: 'PagoMóvil', status: 'Pagado', amountUsdCents: 2900 },
];

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
