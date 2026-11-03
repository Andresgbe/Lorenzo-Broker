import { useSearchParams } from 'react-router-dom';
import { renewalExpiresOn, useMembership } from '../../../entities/membership';
import { MAIN_PLAN, findPlan, type Plan } from '../../../entities/plan';
import { useAuth } from '../../../entities/session';

// Sin 12: pagar un año entero siempre sale mejor con el plan anual.
export const RENEWAL_MONTHS = [1, 2, 3, 6] as const;

export function monthsLabel(months: number) {
  return months === 1 ? '1 mes' : `${months} meses`;
}

/**
 * Lo que se está comprando: primera compra o renovación, según la membresía real del usuario.
 * Los meses viajan en ?meses=, igual que el plan, para sobrevivir a un refresh; solo cuentan al
 * renovar el plan mensual. "Renovación" es también quien ya venció, pero no a quien le revocaron
 * el acceso. Sin plan elegido (paso 1) vale el que ya tiene, o el mensual.
 */
export function useCheckoutOrder(selectedPlan: Plan | null) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { membership, isLoading: isMembershipLoading } = useMembership(user?.id);
  const [params] = useSearchParams();

  const requested = Number(params.get('meses'));
  const isRenewal = membership !== null;
  const plan = selectedPlan ?? findPlan(membership?.planId) ?? MAIN_PLAN;
  const months = isRenewal && plan.period === 'month' && (RENEWAL_MONTHS as readonly number[]).includes(requested) ? requested : 1;

  return {
    isLoading: isAuthLoading || isMembershipLoading,
    isSignedIn: user !== null,
    membership,
    isRenewal,
    plan,
    months,
    periodLabel: plan.period === 'year' ? '1 año' : monthsLabel(months),
    total: plan.price * months,
    newExpiresOn: membership ? renewalExpiresOn(membership, months * plan.durationDays) : null,
    /** Para enlaces a otros pasos: "&meses=3", vacío si es un solo mes. */
    monthsQuery: months > 1 ? `&meses=${months}` : '',
  };
}
