import { Navigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '../../entities/membership';
import { formatPrice, useSelectedPlan } from '../../entities/plan';
import { monthsLabel, useCheckoutOrder } from '../../features/renew-membership';
import { ROUTES } from '../../shared/config/routes';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';
import { findPaymentMethod } from '../../shared/config/payment-methods';
import { Button } from '../../shared/ui/Button';
import { CheckoutLoading, CheckoutShell } from '../../widgets/checkout-shell';

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
  const [params] = useSearchParams();
  const method = findPaymentMethod(params.get('metodo'));
  const order = useCheckoutOrder(plan?.price ?? 0);

  if (!plan) {
    return <Navigate to={ROUTES.checkoutPlan} replace />;
  }
  if (order.isLoading) return <CheckoutLoading step={3} />;

  return (
    <CheckoutShell
      step={3}
      title={order.isRenewal ? 'Estamos verificando tu renovación' : 'Estamos verificando tu pago'}
      subtitle={order.membership?.status === 'active' ? 'Tu acceso sigue activo mientras tanto.' : undefined}
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
          {order.isRenewal && (
            <div className="flex items-baseline justify-between gap-4 text-[14px]">
              <span className="text-muted">Renovación</span>
              <span className="text-ink">{monthsLabel(order.months)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="text-muted">Monto</span>
            <span className="text-ink">{formatPrice(order.total)}</span>
          </div>
          {order.newExpiresOn && (
            <div className="flex items-baseline justify-between gap-4 text-[14px]">
              <span className="text-muted">Al confirmarse, llega hasta el</span>
              <span className="text-ink">{formatDate(order.newExpiresOn)}</span>
            </div>
          )}
          {method && (
            <div className="flex items-baseline justify-between gap-4 text-[14px]">
              <span className="text-muted">Método</span>
              <span className="text-ink">{method.label}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 text-[14px]">
            <span className="text-muted">Estado</span>
            <span className="text-gold font-semibold">En verificación</span>
          </div>
        </div>

        <Button to={order.isSignedIn ? ROUTES.student : ROUTES.home} variant="ghost" className="w-full">
          {order.isSignedIn ? 'Volver a tu área' : 'Volver al inicio'}
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
