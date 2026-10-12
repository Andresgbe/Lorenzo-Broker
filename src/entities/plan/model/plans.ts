import type { Plan, PlanId } from './types';

/**
 * Hoy existe un solo plan. Se mantiene como lista porque las pantallas de
 * checkout ya navegan por id; añadir otro plan es agregar una entrada aquí.
 */
export const PLANS: Plan[] = [
  {
    id: 'mensual',
    name: 'Membresía mensual',
    price: 29,
    billingNote: 'Se cobra cada mes',
    perks: [
      'Todas las clases en vivo',
      'Biblioteca de clases grabadas',
      'Material en PDF descargable',
      'Acceso a la comunidad',
      'Cancela cuando quieras',
    ],
  },
];

export const MAIN_PLAN = PLANS[0];
export const DEFAULT_PLAN_ID: PlanId = MAIN_PLAN.id;

/** Para importes que todavía no podemos calcular (totales agregados). */
export const PRICE_PLACEHOLDER = '[PRECIO]';

export function formatPrice(amount: number) {
  return `$${amount}`;
}

export function findPlan(id: string | null): Plan | null {
  return PLANS.find((plan) => plan.id === id) ?? null;
}
