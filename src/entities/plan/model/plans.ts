import type { Plan, PlanId } from './types';

/**
 * Los planes que se ofrecen. Cada uno también existe en la tabla plans de la BD
 * (migraciones 0003 y 0008): un cambio de precio o duración va en los dos sitios.
 */
export const PLANS: Plan[] = [
  {
    id: 'mensual',
    name: 'Membresía mensual',
    price: 29,
    billingNote: 'Se cobra cada mes',
    period: 'month',
    durationDays: 30,
    perks: [
      'Todas las clases en vivo',
      'Biblioteca de clases grabadas',
      'Material en PDF descargable',
      'Acceso a la comunidad',
      'Cancela cuando quieras',
    ],
  },
  {
    id: 'anual',
    name: 'Membresía anual',
    price: 297,
    billingNote: 'Se cobra una vez al año',
    period: 'year',
    durationDays: 365,
    perks: [
      'Todas las clases en vivo',
      'Biblioteca de clases grabadas',
      'Material en PDF descargable',
      'Acceso a la comunidad',
    ],
  },
];

export const MAIN_PLAN = PLANS[0];
export const ANNUAL_PLAN = PLANS[1];
export const DEFAULT_PLAN_ID: PlanId = MAIN_PLAN.id;

/** Para importes que todavía no podemos calcular (totales agregados). */
export const PRICE_PLACEHOLDER = '[PRECIO]';

export function formatPrice(amount: number) {
  return `$${amount}`;
}

/** Lo que se ahorra un plan anual frente a pagar 12 meses. 0 en un plan mensual. */
export function annualSavings(plan: Plan) {
  return plan.period === 'year' ? Math.max(0, MAIN_PLAN.price * 12 - plan.price) : 0;
}

export function findPlan(id: string | null | undefined): Plan | null {
  return PLANS.find((plan) => plan.id === id) ?? null;
}
