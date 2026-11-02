import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  PAYMENT_STATUS_TONE,
  formatBs,
  formatDateTimeCaracas,
  formatUsd,
  getReceiptUrl,
  usePaymentDetail,
  type PaymentEvent,
} from '../../entities/payment';
import { ROUTES } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { FormAlert } from '../../shared/ui/FormAlert';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AdminTopBar } from '../../widgets/admin-shell';

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function Card({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('bg-panel border border-line rounded-[18px] p-6 sm:p-7', className)}>
      <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-5">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd className="text-[14.5px] text-ink break-words">{children}</dd>
    </div>
  );
}

function Timeline({ events }: { events: PaymentEvent[] }) {
  return (
    <ol className="flex flex-col">
      {events.map((event, index) => (
        <li key={`${event.at}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
          {index < events.length - 1 && <span aria-hidden="true" className="absolute left-[5px] top-4 bottom-0 w-px bg-line" />}
          <span aria-hidden="true" className="mt-1.5 w-[11px] h-[11px] shrink-0 rounded-full border-2 border-accent bg-panel" />
          <div className="min-w-0">
            <p className="text-[14px] text-ink">{event.label}</p>
            <p className="text-[12px] text-muted mt-0.5">
              {formatDateTimeCaracas(event.at)}
              {event.by && ` · ${event.by}`}
            </p>
            {event.note && <p className="text-[13px] text-ink-soft mt-1.5">“{event.note}”</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ReceiptButton({ path }: { path: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  async function open() {
    setState('loading');
    try {
      window.location.assign(await getReceiptUrl(path));
      setState('idle');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="ghost" onClick={() => void open()} disabled={state === 'loading'}>
        {state === 'loading' ? 'Abriendo…' : 'Ver comprobante'}
      </Button>
      {state === 'error' && <span className="text-[11.5px] text-red-400">No se pudo abrir. Intenta de nuevo.</span>}
    </div>
  );
}

/**
 * Detalle de un pago (16 Pagos › Ver detalle): montos en USD y Bs, tasa, método,
 * referencia, comprobante si fue reportado, alumno e historial. Solo lectura:
 * confirmar y rechazar a mano vuelven cuando escriban de verdad, con motivo.
 */
export function AdminPaymentPage() {
  const { paymentId } = useParams();
  const { payment, failed, isLoading } = usePaymentDetail(paymentId);

  if (isLoading) return <p className="text-muted text-[14px]">Cargando pago…</p>;

  if (!payment) {
    return (
      <>
        <AdminTopBar backTo={ROUTES.adminPayments} backLabel="Volver a pagos" crumbs={[{ label: 'Pagos', to: ROUTES.adminPayments }, { label: 'Pago' }]} />
        {failed ? (
          <FormAlert variant="error">No pudimos cargar el pago. Intenta de nuevo en un momento.</FormAlert>
        ) : (
          <div className="bg-panel border border-line rounded-[18px] p-8 text-center">
            <p className="text-[15px] text-ink">No encontramos ese pago.</p>
            <p className="text-[13.5px] text-muted mt-1.5">Puede que el enlace esté mal escrito. Vuelve a la lista de pagos.</p>
          </div>
        )}
      </>
    );
  }

  const student = payment.studentName ?? 'Alumno sin datos';

  return (
    <>
      <AdminTopBar
        backTo={ROUTES.adminPayments}
        backLabel="Volver a pagos"
        crumbs={[{ label: 'Pagos', to: ROUTES.adminPayments }, { label: student }]}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[12.5px] text-muted">
            Pago {payment.id.slice(0, 8).toUpperCase()} · {formatDateTimeCaracas(payment.createdAt)}
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,3.4vw,38px)] text-ink mt-1 leading-tight">{formatUsd(payment.amountUsdCents)}</h1>
          {payment.amountBsCents !== null && <p className="text-[14px] text-muted mt-1">{formatBs(payment.amountBsCents)}</p>}
        </div>
        <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
      </div>

      {payment.status === 'Monto por revisar' && (
        <p className="mb-6 px-4 py-3 rounded-[10px] border border-gold/30 bg-gold/10 text-[13.5px] text-ink-soft">
          El monto recibido no coincide con el esperado. Revísalo en el banco antes de dar acceso.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] items-start">
        <div className="flex flex-col gap-5">
          <Card title="Pago">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Monto en dólares">{formatUsd(payment.amountUsdCents)}</Field>
              <Field label="Monto en bolívares">{payment.amountBsCents !== null ? formatBs(payment.amountBsCents) : '—'}</Field>
              <Field label="Tasa usada">
                {payment.rate !== null ? `${payment.rate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs por dólar` : '—'}
              </Field>
              <Field label="Método">{payment.method ?? '—'}</Field>
              <Field label="Referencia">
                <span className="font-mono text-[13.5px]">{payment.reference ?? '—'}</span>
              </Field>
              <Field label="Plan">{payment.planName}</Field>
              <Field label="Fecha">{formatDateTimeCaracas(payment.createdAt)}</Field>
            </dl>
          </Card>

          {payment.receiptPath && (
            <Card title="Comprobante">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-[10px] bg-panel-2 border border-line text-muted">
                    <FileIcon className="w-5 h-5" />
                  </span>
                  <p className="text-[14px] text-ink truncate min-w-0">{payment.receiptPath.split('/').pop()}</p>
                </div>
                <ReceiptButton path={payment.receiptPath} />
              </div>
            </Card>
          )}

          <Card title="Historial">
            <Timeline events={payment.events} />
          </Card>
        </div>

        <Card title="Alumno">
          <dl className="flex flex-col gap-5">
            <Field label="Nombre">{student}</Field>
            <Field label="Cédula o RIF">{payment.studentTaxId ?? '—'}</Field>
            <Field label="Correo">{payment.studentEmail ?? '—'}</Field>
          </dl>
        </Card>
      </div>
    </>
  );
}
