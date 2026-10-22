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
      <span className="text-ink text-right break-all">{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-4">{children}</h2>;
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
      topBar={{
        backTo: ROUTES.checkoutPlan,
        backLabel: 'Volver al plan',
        crumbs: [{ label: 'Plan', to: ROUTES.checkoutPlan }, { label: 'Pago' }],
      }}
      width="wide"
      eyebrow="Confirma tu pago"
      title="Da tu siguiente paso"
    >
      {/* Una sola tarjeta: arriba tus datos y el plan, en medio el método de pago y abajo,
          siempre al final, el total con el botón de pagar. */}
      <section className="bg-panel border border-line rounded-[20px] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="grid md:grid-cols-2">
          <div className="p-6 sm:p-8">
            <SectionLabel>Tus datos</SectionLabel>
            <div className="flex flex-col gap-3">
              <Row label="Nombre" value={user?.fullName || '—'} />
              <Row label="Cédula o RIF" value={user?.taxId || '—'} />
              <Row label="Correo" value={user?.email || '—'} />
            </div>
            <Link to={ROUTES.studentAccount} className="inline-block mt-5 text-[13px] text-accent hover:underline">
              Editar datos
            </Link>
          </div>

          <div className="p-6 sm:p-8 border-t border-line md:border-t-0 md:border-l">
            <SectionLabel>Tu plan</SectionLabel>
            <div className="flex flex-col gap-3">
              <Row label="Plan" value={plan.name} />
              <Row label="Cobro" value={plan.billingNote} />
              <Row label="Precio" value={formatPrice(plan.price)} />
            </div>
            <Link to={ROUTES.checkoutPlan} className="inline-block mt-5 text-[13px] text-accent hover:underline">
              Cambiar de plan
            </Link>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-line">
          <SectionLabel>Método de pago</SectionLabel>
          <div role="radiogroup" aria-label="Método de pago" className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {PAYMENT_METHODS.map((option) => (
              <label
                key={option.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-colors',
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
                  {option.note && <span className="block text-[12px] text-muted">{option.note}</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 p-6 sm:px-8 border-t border-line bg-bg-2/60 rounded-b-[20px]">
          <div>
            <span className="block text-[12.5px] text-muted">Total a pagar</span>
            <span className="font-display font-bold text-[34px] leading-none text-ink">{formatPrice(plan.price)}</span>
            <span className="text-[13px] text-muted ml-2">{plan.billingNote.toLowerCase()}</span>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto sm:min-w-[300px]"
            onClick={() => navigate(`${ROUTES.checkoutPay}?plan=${plan.id}&metodo=${method}`)}
          >
            Continuar con {PAYMENT_METHODS.find((option) => option.id === method)?.label}
          </Button>
        </div>
      </section>
    </CheckoutShell>
  );
}
