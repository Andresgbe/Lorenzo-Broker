export type PlanId = 'mensual' | 'trimestral' | 'anual';

export interface Plan {
  id: PlanId;
  name: string;
  /** Qué se cobra cada vez, p. ej. "cada 3 meses". */
  billingNote: string;
  perks: string[];
  /** Solo uno puede ir destacado. */
  highlighted?: boolean;
  badge?: string;
}
