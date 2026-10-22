import type { StatusTone } from '../../../shared/ui/StatusPill';

export type PaymentStatus = 'Pagado' | 'En verificación' | 'Rechazado';

export interface Payment {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  studentName: string;
  studentTaxId: string;
  planName: string;
  method: string;
  status: PaymentStatus;
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  Pagado: 'success',
  'En verificación': 'warning',
  Rechazado: 'danger',
};

/** Datos de ejemplo. Reemplazar por la tabla de pagos de Supabase. */
export const DEMO_PAYMENTS: Payment[] = [
  { id: 'pg-108', date: '2026-10-11', studentName: 'María Pérez', studentTaxId: 'V-12345678', planName: 'Mensual', method: 'PagoMóvil', status: 'En verificación' },
  { id: 'pg-107', date: '2026-10-11', studentName: 'José Rodríguez', studentTaxId: 'V-20811223', planName: 'Mensual', method: 'Transferencia', status: 'En verificación' },
  { id: 'pg-106', date: '2026-10-10', studentName: 'Andrea Molina', studentTaxId: 'V-18992341', planName: 'Mensual', method: 'Zelle', status: 'Pagado' },
  { id: 'pg-105', date: '2026-10-09', studentName: 'Carlos Lugo', studentTaxId: 'V-15340982', planName: 'Mensual', method: 'Binance Pay', status: 'Pagado' },
  { id: 'pg-104', date: '2026-10-08', studentName: 'Daniela Ruiz', studentTaxId: 'V-22104567', planName: 'Mensual', method: 'PagoMóvil', status: 'Pagado' },
  { id: 'pg-103', date: '2026-10-07', studentName: 'Luis Hernández', studentTaxId: 'V-17883420', planName: 'Mensual', method: 'Transferencia', status: 'Rechazado' },
  { id: 'pg-102', date: '2026-10-06', studentName: 'Patricia Gómez', studentTaxId: 'V-13550871', planName: 'Mensual', method: 'Zelle', status: 'Pagado' },
  { id: 'pg-101', date: '2026-10-05', studentName: 'Rafael Mendoza', studentTaxId: 'V-19220045', planName: 'Mensual', method: 'PagoMóvil', status: 'Pagado' },
];

export type PaymentSource = 'Cobrix' | 'Reporte manual';

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
  studentEmail: string;
  /** Dinero siempre en céntimos enteros. */
  amountUsdCents: number;
  amountBsCents: number;
  /** Bs por USD usada para cobrar. */
  rate: number;
  source: PaymentSource;
  /** Referencia de Cobrix, o la que escribió el alumno al reportar. */
  reference: string;
  /** ISO en UTC. */
  createdAt: string;
  /** Solo en pagos reportados a mano ("Reporté mi pago"). */
  receipt: { fileName: string; sizeKb: number } | null;
  events: PaymentEvent[];
}

// Detalle de ejemplo, derivado de DEMO_PAYMENTS. Con datos reales sale de payments,
// payment_reports y admin_actions (migración 0003).
const DEMO_RATE = 215.37;
const MANUAL_METHODS = ['Zelle', 'Binance Pay'];

export function findDemoPaymentDetail(id: string | undefined): PaymentDetail | null {
  const payment = DEMO_PAYMENTS.find((item) => item.id === id);
  if (!payment) return null;

  const amountUsdCents = 2900;
  const source: PaymentSource = MANUAL_METHODS.includes(payment.method) ? 'Reporte manual' : 'Cobrix';
  const serial = payment.id.replace(/\D/g, '');
  const createdAt = `${payment.date}T14:32:00Z`;
  const firstName = payment.studentName.split(' ')[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const events: PaymentEvent[] =
    source === 'Cobrix'
      ? [{ at: createdAt, label: `Pago iniciado en Cobrix (${payment.method})` }]
      : [{ at: createdAt, label: `El alumno reportó un pago por ${payment.method}`, by: payment.studentName, note: 'Subió el comprobante.' }];

  if (payment.status === 'Pagado') {
    events.push(
      source === 'Cobrix'
        ? { at: `${payment.date}T14:41:00Z`, label: 'Cobrix confirmó el pago', note: 'Webhook verificado: firma y monto correctos.' }
        : { at: `${payment.date}T18:05:00Z`, label: 'Pago aprobado a mano', by: 'Lorenzo Pérez', note: 'Revisé el comprobante y el dinero llegó.' },
      { at: `${payment.date}T18:05:01Z`, label: 'Acceso activado por 30 días' },
    );
  } else if (payment.status === 'Rechazado') {
    events.push({ at: `${payment.date}T20:10:00Z`, label: 'Pago rechazado', by: 'Lorenzo Pérez', note: 'La referencia no aparece en el banco.' });
  }

  return {
    ...payment,
    studentEmail: `${firstName}@ejemplo.com`,
    amountUsdCents,
    amountBsCents: Math.round(amountUsdCents * DEMO_RATE),
    rate: DEMO_RATE,
    source,
    reference: source === 'Cobrix' ? `CBX-2026${serial}0417` : `${payment.method === 'Zelle' ? 'ZL' : 'BN'}-${serial}88231`,
    createdAt,
    receipt: source === 'Reporte manual' ? { fileName: `comprobante-${payment.id}.jpg`, sizeKb: 412 } : null,
    events,
  };
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
