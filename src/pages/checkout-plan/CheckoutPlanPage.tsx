import { useNavigate } from 'react-router-dom';
import { MAIN_PLAN, PlanCard } from '../../entities/plan';
import { ROUTES } from '../../shared/config/routes';
import { PAYMENT_METHODS } from '../../shared/config/payment-methods';
import { Button } from '../../shared/ui/Button';
import { CheckoutShell } from '../../widgets/checkout-shell';

export function CheckoutPlanPage() {
  const navigate = useNavigate();

  return (
    <CheckoutShell
      step={1}
      eyebrow="Suscripción"
      title="Tu membresía"
      subtitle="Un solo plan con todo incluido. Sin permanencia: cancelas cuando quieras."
    >
      <PlanCard plan={MAIN_PLAN} />

      <Button
        variant="primary"
        className="w-full mt-6"
        onClick={() => navigate(`${ROUTES.checkoutSummary}?plan=${MAIN_PLAN.id}`)}
      >
        Continuar al pago
      </Button>

      <p className="mt-6 text-center text-[12px] text-muted">
        Pagos procesados por Cobrix · {PAYMENT_METHODS.map((method) => method.label).join(', ')}
      </p>
    </CheckoutShell>
  );
}
