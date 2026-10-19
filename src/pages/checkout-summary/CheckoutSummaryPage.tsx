import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { formatPrice, useSelectedPlan } from '../../entities/plan';
import { ROUTES } from '../../shared/config/routes';
import { PAYMENT_METHODS } from '../../shared/config/payment-methods';
import { Button } from '../../shared/ui/Button';
import { CheckoutShell } from '../../widgets/checkout-shell';
import { cn } from '../../shared/lib/cn';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[14px]">
      <span className="text-muted">{label}</span>
      <span className="text-ink text-right">{value}</span>
    </div>
  );
}

export function CheckoutSummaryPage() {
  const plan = useSelectedPlan();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);

  if (!plan) {
    return <Navigate to={ROUTES.checkoutPlan} replace />;
  }

  return (
    <CheckoutShell
      step={2}
      width="medium"
      eyebrow="Confirma tu pago"
      title="Revisa antes de pagar"
      subtitle="Te llevaremos a Cobrix para completar el pago con el método que elijas."
    >
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] items-start">
        <div className="flex flex-col gap-5">
          <section className="bg-panel border border-line rounded-[18px] p-6">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-4">
              Datos del alumno
            </h2>
            <div className="flex flex-col gap-2.5">
              <Row label="Nombre" value={user?.fullName ?? '—'} />
              <Row label="Cédula o RIF" value={user?.taxId ?? '—'} />
              <Row label="Correo" value={user?.email ?? '—'} />
            </div>
            <Link
              to={ROUTES.register}
              className="inline-block mt-5 text-[13px] text-accent hover:underline"
            >
              Editar datos
            </Link>
          </section>

          <section className="bg-panel border border-line rounded-[18px] p-6">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-4">
              Método de pago
            </h2>
            <div className="flex flex-col gap-2">
              {PAYMENT_METHODS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-colors',
                    method === option.id ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/40'
                  )}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={option.id}
                    checked={method === option.id}
                    onChange={() => setMethod(option.id)}
                    className="w-4 h-4 accent-accent cursor-pointer shrink-0"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] text-ink">{option.label}</span>
                    <span className="block text-[12px] text-muted">{option.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-panel border border-accent/40 rounded-[18px] p-6 shadow-[0_0_50px_rgba(37,233,138,0.08)]">
          <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-4">Resumen</h2>
          <div className="flex flex-col gap-2.5">
            <Row label="Plan" value={plan.name} />
            <Row label="Cobro" value={plan.billingNote} />
          </div>

          <div className="h-px bg-line my-5" />

          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[14px] text-muted">Total</span>
            <span className="font-display font-extrabold text-[30px] leading-none text-ink">
              {formatPrice(plan.price)}
            </span>
          </div>

          <Button
            variant="primary"
            className="w-full mt-6"
            onClick={() => navigate(`${ROUTES.checkoutPending}?plan=${plan.id}`)}
          >
            Pagar con Cobrix
          </Button>

          <Link
            to={ROUTES.checkoutPlan}
            className="block text-center mt-4 text-[13px] text-muted hover:text-accent transition-colors"
          >
            Cambiar de plan
          </Link>
        </section>
      </div>
    </CheckoutShell>
  );
}
