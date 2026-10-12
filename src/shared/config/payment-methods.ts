export interface PaymentMethod {
  id: string;
  label: string;
  /** Cuánto suele tardar en confirmarse. Determina si el pago pasa por "en verificación". */
  note: string;
}

// Los tiempos son estimaciones provisionales. Ajustar con lo que tarde Cobrix de verdad.
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pago-movil', label: 'PagoMóvil', note: 'Suele confirmarse en segundos' },
  { id: 'transferencia', label: 'Transferencia', note: 'Puede tardar unas horas' },
  { id: 'zelle', label: 'Zelle', note: 'Puede tardar unas horas' },
  { id: 'binance-pay', label: 'Binance Pay', note: 'Suele confirmarse en minutos' },
];
