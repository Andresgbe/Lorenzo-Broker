import { useSearchParams } from 'react-router-dom';
import { renewalExpiresOn, useMembership } from '../../../entities/membership';
import { useAuth } from '../../../entities/session';

export const RENEWAL_MONTHS = [1, 2, 3, 6, 12] as const;

export function monthsLabel(months: number) {
  return months === 1 ? '1 mes' : `${months} meses`;
}

/**
 * Lo que se está comprando: primera compra o renovación, según la membresía real del usuario.
 * Los meses viajan en ?meses=, igual que el plan, para sobrevivir a un refresh; solo cuentan al
 * renovar. "Renovación" es también quien ya venció, pero no a quien le revocaron el acceso.
 */
export function useCheckoutOrder(unitPrice: number) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { membership, isLoading: isMembershipLoading } = useMembership(user?.id);
  const [params] = useSearchParams();

  const requested = Number(params.get('meses'));
  const isRenewal = membership !== null;
  const months = isRenewal && (RENEWAL_MONTHS as readonly number[]).includes(requested) ? requested : 1;

  return {
    isLoading: isAuthLoading || isMembershipLoading,
    isSignedIn: user !== null,
    membership,
    isRenewal,
    months,
    total: unitPrice * months,
    newExpiresOn: membership ? renewalExpiresOn(membership, months) : null,
    /** Para enlaces a otros pasos: "&meses=3", vacío si es un solo mes. */
    monthsQuery: months > 1 ? `&meses=${months}` : '',
  };
}
