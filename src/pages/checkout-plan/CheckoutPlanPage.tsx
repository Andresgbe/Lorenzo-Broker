import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanCard, PLANS, PRICE_PLACEHOLDER, DEFAULT_PLAN_ID, type Plan } from '../../entities/plan';
import { ROUTES } from '../../shared/config/routes';
import { PAYMENT_METHODS } from '../../shared/config/payment-methods';
import { Button } from '../../shared/ui/Button';
import { CheckoutShell } from '../../widgets/checkout-shell';

export function CheckoutPlanPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Plan>(
    () => PLANS.find((plan) => plan.id === DEFAULT_PLAN_ID) ?? PLANS[0]
  );

  function goToSummary() {
    navigate(`${ROUTES.checkoutSummary}?plan=${selected.id}`);
  }

  return (
    <CheckoutShell
      step={1}
      width="wide"
      eyebrow="Suscripción"
      title="Elige tu membresía"
      subtitle="Todas incluyen las clases en vivo y el acceso a la comunidad. Puedes cambiar o cancelar cuando quieras."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} selected={plan.id === selected.id} onSelect={setSelected} />
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-panel border border-line rounded-[18px] px-6 py-5">
        <p className="text-[14px] text-muted">
          Seleccionado:{' '}
          <span className="text-ink font-semibold">
            {selected.name} — ${PRICE_PLACEHOLDER}
          </span>
        </p>
        <Button variant="primary" onClick={goToSummary} className="w-full sm:w-auto">
          Continuar al pago
        </Button>
      </div>

      <p className="mt-6 text-center text-[12px] text-muted">
        Pagos procesados por Cobrix · {PAYMENT_METHODS.map((method) => method.label).join(', ')}
      </p>
    </CheckoutShell>
  );
}
