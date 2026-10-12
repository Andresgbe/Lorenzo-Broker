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
  { id: 'pg-108', date: '2026-10-11', studentName: 'María Pérez', studentTaxId: 'V-12345678', planName: 'Trimestral', method: 'PagoMóvil', status: 'En verificación' },
  { id: 'pg-107', date: '2026-10-11', studentName: 'José Rodríguez', studentTaxId: 'V-20811223', planName: 'Mensual', method: 'Transferencia', status: 'En verificación' },
  { id: 'pg-106', date: '2026-10-10', studentName: 'Andrea Molina', studentTaxId: 'V-18992341', planName: 'Anual', method: 'Zelle', status: 'Pagado' },
  { id: 'pg-105', date: '2026-10-09', studentName: 'Carlos Lugo', studentTaxId: 'V-15340982', planName: 'Trimestral', method: 'Binance Pay', status: 'Pagado' },
  { id: 'pg-104', date: '2026-10-08', studentName: 'Daniela Ruiz', studentTaxId: 'V-22104567', planName: 'Mensual', method: 'PagoMóvil', status: 'Pagado' },
  { id: 'pg-103', date: '2026-10-07', studentName: 'Luis Hernández', studentTaxId: 'V-17883420', planName: 'Mensual', method: 'Transferencia', status: 'Rechazado' },
  { id: 'pg-102', date: '2026-10-06', studentName: 'Patricia Gómez', studentTaxId: 'V-13550871', planName: 'Trimestral', method: 'Zelle', status: 'Pagado' },
  { id: 'pg-101', date: '2026-10-05', studentName: 'Rafael Mendoza', studentTaxId: 'V-19220045', planName: 'Anual', method: 'PagoMóvil', status: 'Pagado' },
];
