import type { Plan, PlanId } from './types';

/**
 * Los diseños dejan el precio como marcador a propósito. No inventes cifras:
 * cuando existan, deberían venir de Supabase junto al resto del contenido editable.
 */
export const PRICE_PLACEHOLDER = '[PRECIO]';

// Nombres, condiciones de cobro y beneficios son texto provisional, inferido del
// diseño. Reemplazar con el copy definitivo antes de lanzar.
export const PLANS: Plan[] = [
  {
    id: 'mensual',
    name: 'Mensual',
    billingNote: 'Se cobra cada mes',
    perks: ['Todas las clases en vivo', 'Material en PDF descargable', 'Acceso a la comunidad'],
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    billingNote: 'Se cobra cada 3 meses',
    perks: [
      'Todas las clases en vivo',
      'Material en PDF descargable',
      'Acceso a la comunidad',
      'Clases grabadas',
    ],
    highlighted: true,
    badge: 'Más elegido',
  },
  {
    id: 'anual',
    name: 'Anual',
    billingNote: 'Se cobra una vez al año',
    perks: [
      'Todas las clases en vivo',
      'Material en PDF descargable',
      'Acceso a la comunidad',
      'Clases grabadas',
    ],
  },
];

export function findPlan(id: string | null): Plan | null {
  return PLANS.find((plan) => plan.id === id) ?? null;
}

export const DEFAULT_PLAN_ID: PlanId = 'trimestral';
