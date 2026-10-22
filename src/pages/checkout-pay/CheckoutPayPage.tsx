import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { formatBs } from '../../entities/payment';
import { formatPrice, useSelectedPlan } from '../../entities/plan';
import { DEMO_EXCHANGE_RATE, findPaymentMethod } from '../../shared/config/payment-methods';
import { ROUTES } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/TextField';
import { CheckoutShell } from '../../widgets/checkout-shell';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Sin permiso de portapapeles: el dato sigue visible para copiarlo a mano.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copiar ${label}`}
      className="shrink-0 text-[12.5px] font-semibold text-accent hover:underline cursor-pointer"
    >
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[14px]">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-3 min-w-0">
        <span className="text-ink text-right break-all">{value}</span>
        {copy && <CopyButton value={value} label={label} />}
      </span>
    </div>
  );
}

/**
 * Paso de pago sin pasarela: muestra los datos (de ejemplo) del método elegido y el monto,
 * el alumno paga por su cuenta, escribe la referencia y pasa a "Estamos verificando tu pago".
 * El plan y el método viajan en ?plan= y ?metodo= para sobrevivir a un refresh.
 */
export function CheckoutPayPage() {
  const plan = useSelectedPlan();
  const [params] = useSearchParams();
  const method = findPaymentMethod(params.get('metodo'));
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!plan) return <Navigate to={ROUTES.checkoutPlan} replace />;
  if (!method) return <Navigate to={`${ROUTES.checkoutSummary}?plan=${plan.id}`} replace />;

  const summaryPath = `${ROUTES.checkoutSummary}?plan=${plan.id}`;
  const amount =
    method.currency === 'VES' ? formatBs(Math.round(plan.price * 100 * DEMO_EXCHANGE_RATE)) : `${formatPrice(plan.price)} USD`;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (reference.trim().length < 4) {
      setError('Escribe la referencia que te dio tu banco o app.');
      return;
    }
    navigate(`${ROUTES.checkoutPending}?plan=${plan!.id}&metodo=${method!.id}`);
  }

  return (
    <CheckoutShell
      step={2}
      topBar={{
        backTo: summaryPath,
        backLabel: 'Volver a elegir el método de pago',
        crumbs: [
          { label: 'Plan', to: `${ROUTES.checkoutPlan}` },
          { label: 'Pago', to: summaryPath },
          { label: method.label },
        ],
      }}
      title={`Paga con ${method.label}`}
      subtitle="Haz el pago con estos datos y luego escribe la referencia para que lo verifiquemos."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-panel border border-accent/40 rounded-[18px] p-6 flex flex-col gap-3 shadow-[0_0_50px_rgba(0,176,154,0.08)]">
          <span className="block text-[12.5px] text-muted">Monto a pagar</span>
          <span className="font-display font-bold text-[34px] leading-none text-ink">{amount}</span>
          {method.currency === 'VES' && (
            <span className="text-[12.5px] text-muted">
              {formatPrice(plan.price)} a la tasa de {DEMO_EXCHANGE_RATE.toLocaleString('es-VE')} Bs por dólar
            </span>
          )}
        </div>

        <div className="bg-panel border border-line rounded-[18px] p-6 flex flex-col gap-3">
          <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-1">Datos para pagar</h2>
          {method.payTo.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} copy />
          ))}
          <Row label="Concepto" value={plan.name} />
        </div>

        <div className="bg-panel border border-line rounded-[18px] p-6">
          <TextField
            label="Referencia del pago"
            placeholder={method.currency === 'VES' ? 'Ej. 001234567890' : 'Ej. el código de la operación'}
            hint="El número que te muestra tu banco o tu app al terminar el pago."
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              if (error) setError(null);
            }}
            error={error ?? undefined}
          />
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Ya pagué
        </Button>
      </form>
    </CheckoutShell>
  );
}
