import { ANNUAL_PRICE_USD, MONTHLY_PRICE_USD } from '../../../shared/config/pricing';
import type { Plan, PlanId } from './types';

/**
 * Los planes que se ofrecen. Cada uno también existe en la tabla plans de la BD
 * (migraciones 0003 y 0008): un cambio de duración va en los dos sitios. Los precios salen de
 * shared/config/pricing.ts; si cambian, hay que actualizar también la tabla plans (migración).
 */
export const PLANS: Plan[] = [
  {
    id: 'mensual',
    name: 'Membresía mensual',
    price: MONTHLY_PRICE_USD,
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
    price: ANNUAL_PRICE_USD,
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

/** Redondea a céntimos: 27.77 × 3 en coma flotante no da 83.31 exacto. */
function roundToCents(amount: number) {
  return Math.round(amount * 100) / 100;
}

/** Precio de varios meses (o unidades) sin errores de coma flotante. */
export function priceTimes(price: number, times: number) {
  return roundToCents(price * times);
}

/** $27.77, o $297 si no tiene céntimos. */
export function formatPrice(amount: number) {
  const rounded = roundToCents(amount);
  return `$${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}

/** Lo que se ahorra un plan anual frente a pagar 12 meses. 0 en un plan mensual. */
export function annualSavings(plan: Plan) {
  return plan.period === 'year' ? Math.max(0, priceTimes(MAIN_PLAN.price, 12) - plan.price) : 0;
}

export function findPlan(id: string | null | undefined): Plan | null {
  return PLANS.find((plan) => plan.id === id) ?? null;
}
