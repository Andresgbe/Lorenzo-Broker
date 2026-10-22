export interface PaymentMethod {
  id: string;
  label: string;
  /** Cuánto suele tardar en confirmarse. Determina si el pago pasa por "en verificación". */
  note: string;
  /** En qué moneda se paga: bolívares a la tasa del día, o dólares (USD / USDT). */
  currency: 'VES' | 'USD';
  /** Datos que el alumno usa para pagar, en el orden en que se muestran. */
  payTo: { label: string; value: string }[];
}

// Los tiempos son estimaciones provisionales. Ajustar con lo que tarde Cobrix de verdad.
// payTo son datos de ejemplo mientras no haya pasarela: reemplazar por las cuentas reales de Lorenzo.
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pago-movil',
    label: 'PagoMóvil',
    note: '',
    currency: 'VES',
    payTo: [
      { label: 'Banco', value: 'Banco de Venezuela (0102)' },
      { label: 'Teléfono', value: '0414-123-4567' },
      { label: 'Cédula', value: 'V-12345678' },
    ],
  },
  {
    id: 'transferencia',
    label: 'Transferencia',
    note: '',
    currency: 'VES',
    payTo: [
      { label: 'Banco', value: 'Banesco (0134)' },
      { label: 'Número de cuenta', value: '0134-0123-45-1234567890' },
      { label: 'Titular', value: 'Lorenzo Pérez' },
      { label: 'Cédula', value: 'V-12345678' },
    ],
  },
  {
    id: 'zelle',
    label: 'Zelle',
    note: '',
    currency: 'USD',
    payTo: [
      { label: 'Correo de Zelle', value: 'pagos@lorenzobroker.com' },
      { label: 'Titular', value: 'Lorenzo Pérez' },
    ],
  },
  {
    id: 'binance-pay',
    label: 'Binance Pay',
    note: '',
    currency: 'USD',
    payTo: [
      { label: 'Pay ID', value: '123456789' },
      { label: 'Usuario', value: 'LorenzoBroker' },
    ],
  },
];

/** Tasa de ejemplo (Bs por dólar) hasta tener la del día desde el servidor. */
export const DEMO_EXCHANGE_RATE = 215.37;

export function findPaymentMethod(id: string | null): PaymentMethod | null {
  return PAYMENT_METHODS.find((method) => method.id === id) ?? null;
}
