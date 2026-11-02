import { useNavigate, useSearchParams } from 'react-router-dom';
import { caracasDay, formatDate } from '../../entities/membership';
import { MAIN_PLAN, PlanCard, formatPrice } from '../../entities/plan';
import { MonthsPicker, useCheckoutOrder } from '../../features/renew-membership';
import { ROUTES } from '../../shared/config/routes';
import { PAYMENT_METHODS } from '../../shared/config/payment-methods';
import { Button } from '../../shared/ui/Button';
import { StatusPill } from '../../shared/ui/StatusPill';
import { CheckoutLoading, CheckoutShell } from '../../widgets/checkout-shell';

export function CheckoutPlanPage() {
  const navigate = useNavigate();
  const order = useCheckoutOrder(MAIN_PLAN.price);
  const [, setParams] = useSearchParams();

  if (order.isLoading) return <CheckoutLoading step={1} />;

  if (order.membership) {
    const { membership } = order;
    const expiresOn = formatDate(caracasDay(membership.expiresAt));
    const isActive = membership.status === 'active';

    return (
      <CheckoutShell
        step={1}
        topBar={{ backTo: ROUTES.student, backLabel: 'Volver a tu área', crumbs: [{ label: 'Inicio', to: ROUTES.student }, { label: 'Renovar' }] }}
        eyebrow="Tu membresía"
        title={isActive ? 'Renueva o adelanta meses' : 'Renueva tu membresía'}
        subtitle={
          isActive
            ? 'Lo que pagues hoy se suma a tu fecha de vencimiento: no pierdes ningún día.'
            : 'Tu acceso se extiende desde el día en que paguas. Tu progreso sigue guardado.'
        }
      >
        <div className="flex flex-col gap-5">
          <section className="bg-panel border border-line rounded-[18px] p-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display font-bold text-[20px] text-ink">{membership.planName}</p>
              <p className="text-muted text-[13.5px] mt-1">
                {isActive ? 'Vence el' : 'Venció el'} {expiresOn}
              </p>
            </div>
            <StatusPill tone={isActive ? 'success' : 'warning'}>{isActive ? 'Activa' : 'Vencida'}</StatusPill>
          </section>

          <section className="bg-panel border border-line rounded-[18px] p-6">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-4">¿Cuántos meses quieres pagar?</h2>
            <MonthsPicker
              value={order.months}
              onChange={(months) => setParams(months > 1 ? { meses: String(months) } : {}, { replace: true })}
              priceFor={(months) => formatPrice(MAIN_PLAN.price * months)}
            />
          </section>

          <section className="bg-panel border border-accent/40 rounded-[18px] p-6 flex flex-col gap-3 shadow-[0_0_50px_rgba(0,176,154,0.08)]">
            <div className="flex items-baseline justify-between gap-4 text-[14px]">
              <span className="text-muted">Tu acceso llegará hasta el</span>
              <span className="text-ink font-semibold">{order.newExpiresOn && formatDate(order.newExpiresOn)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-4 text-[14px]">
              <span className="text-muted">Total a pagar</span>
              <span className="font-display font-bold text-[24px] text-ink">{formatPrice(order.total)}</span>
            </div>
          </section>
        </div>

        <Button
          variant="primary"
          className="w-full mt-6"
          onClick={() => navigate(`${ROUTES.checkoutSummary}?plan=${MAIN_PLAN.id}${order.monthsQuery}`)}
        >
          Continuar con la renovación
        </Button>

        <p className="mt-6 text-center text-[12px] text-muted">
          Puedes pagar con {PAYMENT_METHODS.map((method) => method.label).join(', ')}
        </p>
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell
      step={1}
      topBar={{ backTo: ROUTES.home, backLabel: 'Volver al inicio', crumbs: [{ label: 'Inicio', to: ROUTES.home }, { label: 'Plan' }] }}
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
        Puedes pagar con {PAYMENT_METHODS.map((method) => method.label).join(', ')}
      </p>
    </CheckoutShell>
  );
}
