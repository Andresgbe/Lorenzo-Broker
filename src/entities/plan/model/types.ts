export type PlanId = 'mensual' | 'anual';

export interface Plan {
  id: PlanId;
  name: string;
  /** Precio en USD, en unidades mayores. */
  price: number;
  /** Qué se cobra cada vez, p. ej. "cada mes". */
  billingNote: string;
  period: 'month' | 'year';
  /** Días de acceso por cada pago. Igual que plans.duration_days en la BD. */
  durationDays: number;
  perks: string[];
}
