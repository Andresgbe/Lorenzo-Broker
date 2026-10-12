export type PlanId = 'mensual';

export interface Plan {
  id: PlanId;
  name: string;
  /** Precio en USD, en unidades mayores. */
  price: number;
  /** Qué se cobra cada vez, p. ej. "cada mes". */
  billingNote: string;
  perks: string[];
}
