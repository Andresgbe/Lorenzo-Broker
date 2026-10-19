import { Navigate } from 'react-router-dom';
import { formatPrice, useSelectedPlan } from '../../entities/plan';
import { ROUTES } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { CheckoutShell } from '../../widgets/checkout-shell';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CheckoutConfirmedPage() {
  const plan = useSelectedPlan();

  if (!plan) {
    return <Navigate to={ROUTES.checkoutPlan} replace />;
  }

  return (
    <CheckoutShell
      step={3}
      title="¡Pago confirmado!"
      subtitle="Tu membresía ya está activa. Te llegará el comprobante por correo."
    >
      <div className="flex flex-col items-center gap-7">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/40 shadow-[0_0_40px_rgba(37,233,138,0.2)]">
          <CheckIcon className="w-7 h-7 text-accent" />
        </span>

        <div className="w-full bg-panel border border-line rounded-[18px] p-6 flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="text-muted">Plan</span>
            <span className="text-ink">{plan.name}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="text-muted">Monto</span>
            <span className="text-ink">{formatPrice(plan.price)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="text-muted">Estado</span>
            <span className="text-accent font-semibold">Activa</span>
          </div>
        </div>

        <Button to={ROUTES.home} variant="primary" className="w-full">
          Entrar ahora
        </Button>
      </div>
    </CheckoutShell>
  );
}
