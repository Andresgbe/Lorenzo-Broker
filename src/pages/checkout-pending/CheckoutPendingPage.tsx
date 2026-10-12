import { Navigate } from 'react-router-dom';
import { formatPrice, useSelectedPlan } from '../../entities/plan';
import { ROUTES } from '../../shared/config/routes';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';
import { Button } from '../../shared/ui/Button';
import { CheckoutShell } from '../../widgets/checkout-shell';

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CheckoutPendingPage() {
  const plan = useSelectedPlan();

  if (!plan) {
    return <Navigate to={ROUTES.checkoutPlan} replace />;
  }

  return (
    <CheckoutShell
      step={3}
      title="Estamos verificando tu pago"
      subtitle="Con PagoMóvil suele confirmarse en segundos; una transferencia puede tardar más. No hace falta que recargues esta página ni que envíes el pago otra vez."
    >
      <div className="flex flex-col items-center gap-7">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30">
          <ClockIcon className="w-7 h-7 text-gold" />
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
            <span className="text-gold font-semibold">En verificación</span>
          </div>
        </div>

        <Button to={ROUTES.home} variant="ghost" className="w-full">
          Volver al inicio
        </Button>

        <p className="text-[12.5px] text-muted text-center">
          ¿Pasó demasiado tiempo?{' '}
          <a
            href={EXTERNAL_LINKS.whatsappSupport}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </CheckoutShell>
  );
}
