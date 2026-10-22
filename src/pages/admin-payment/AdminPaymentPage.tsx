import { useCallback, useState, type FormEvent, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  PAYMENT_STATUS_TONE,
  findDemoPaymentDetail,
  formatBs,
  formatDateTimeCaracas,
  formatUsd,
  type PaymentDetail,
  type PaymentEvent,
} from '../../entities/payment';
import { useAuth } from '../../entities/session';
import { ROUTES } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { MenuButton } from '../../shared/ui/MenuButton';
import { Modal } from '../../shared/ui/Modal';
import { StatusPill } from '../../shared/ui/StatusPill';
import { TextField, inputClasses } from '../../shared/ui/TextField';
import { AdminTopBar } from '../../widgets/admin-shell';

type ReviewAction = 'confirm' | 'reject';

const REASON_MIN = 5;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

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

/**
 * Detalle de un pago (16 Pagos › Ver detalle): montos en USD y Bs, tasa, método,
 * referencia, comprobante si fue reportado, alumno e historial. Confirmar y rechazar
 * piden siempre un motivo, que queda en el historial (admin_actions con datos reales).
 * Todavía con datos de ejemplo: las acciones solo cambian esta vista.
 */
export function AdminPaymentPage() {
  const { paymentId } = useParams();
  const { user } = useAuth();
  const [payment, setPayment] = useState<PaymentDetail | null>(() => findDemoPaymentDetail(paymentId));
  const [review, setReview] = useState<ReviewAction | null>(null);
  const closeReview = useCallback(() => setReview(null), []);

  if (!payment) {
    return (
      <>
        <AdminTopBar backTo={ROUTES.adminPayments} backLabel="Volver a pagos" crumbs={[{ label: 'Pagos', to: ROUTES.adminPayments }, { label: 'Pago' }]} />
        <div className="bg-panel border border-line rounded-[18px] p-8 text-center">
          <p className="text-[15px] text-ink">No encontramos ese pago.</p>
          <p className="text-[13.5px] text-muted mt-1.5">Puede que el enlace esté mal escrito. Vuelve a la lista de pagos.</p>
        </div>
      </>
    );
  }

  const isPending = payment.status === 'En verificación';

  function applyReview(action: ReviewAction, reason: string) {
    const admin = user?.fullName || user?.email || 'Administrador';
    const now = new Date().toISOString();
    setPayment((current) => {
      if (!current) return current;
      const events: PaymentEvent[] =
        action === 'confirm'
          ? [
              { at: now, label: 'Pago aprobado a mano', by: admin, note: reason },
              { at: now, label: 'Acceso activado por 30 días' },
            ]
          : [{ at: now, label: 'Pago rechazado', by: admin, note: reason }];
      return { ...current, status: action === 'confirm' ? 'Pagado' : 'Rechazado', events: [...current.events, ...events] };
    });
    setReview(null);
  }

  return (
    <>
      <AdminTopBar
        backTo={ROUTES.adminPayments}
        backLabel="Volver a pagos"
        crumbs={[{ label: 'Pagos', to: ROUTES.adminPayments }, { label: payment.studentName }]}
        actions={
          isPending && (
            <>
              <Button size="sm" variant="primary" onClick={() => setReview('confirm')}>
                <CheckIcon className="w-4 h-4" />
                Confirmar pago
              </Button>
              <MenuButton
                label="Más acciones del pago"
                items={[{ label: 'Rechazar pago', tone: 'danger', onSelect: () => setReview('reject') }]}
              />
            </>
          )
        }
      />

      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[12.5px] text-muted">
            Pago {payment.id.toUpperCase()} · {formatDateTimeCaracas(payment.createdAt)}
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,3.4vw,38px)] text-ink mt-1 leading-tight">{formatUsd(payment.amountUsdCents)}</h1>
          <p className="text-[14px] text-muted mt-1">{formatBs(payment.amountBsCents)}</p>
        </div>
        <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
      </div>

      {isPending && (
        <p className="mb-6 px-4 py-3 rounded-[10px] border border-gold/30 bg-gold/10 text-[13.5px] text-ink-soft">
          {payment.source === 'Cobrix'
            ? 'Esperando la confirmación de Cobrix. Si ya verificaste el dinero en el banco, puedes confirmarlo a mano.'
            : 'El alumno reportó este pago. Revisa el comprobante y la referencia en el banco antes de confirmarlo.'}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] items-start">
        <div className="flex flex-col gap-5">
          <Card title="Pago">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Monto en dólares">{formatUsd(payment.amountUsdCents)}</Field>
              <Field label="Monto en bolívares">{formatBs(payment.amountBsCents)}</Field>
              <Field label="Tasa usada">
                {payment.rate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs por dólar
              </Field>
              <Field label="Método">{payment.method}</Field>
              <Field label="Origen">{payment.source === 'Cobrix' ? 'Cobrix (automático)' : 'Reportado por el alumno'}</Field>
              <Field label="Referencia">
                <span className="font-mono text-[13.5px]">{payment.reference}</span>
              </Field>
              <Field label="Plan">{payment.planName}</Field>
              <Field label="Fecha">{formatDateTimeCaracas(payment.createdAt)}</Field>
            </dl>
          </Card>

          {payment.receipt && (
            <Card title="Comprobante">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-[10px] bg-panel-2 border border-line text-muted">
                    <FileIcon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] text-ink truncate">{payment.receipt.fileName}</p>
                    <p className="text-[12px] text-muted">{payment.receipt.sizeKb} KB</p>
                  </div>
                </div>
                {/* Con datos reales abre una URL firmada del bucket privado "receipts". */}
                <Button size="sm" variant="ghost" disabled>
                  Ver comprobante
                </Button>
              </div>
            </Card>
          )}

          <Card title="Historial">
            <Timeline events={payment.events} />
          </Card>
        </div>

        <Card title="Alumno">
          <dl className="flex flex-col gap-5">
            <Field label="Nombre">{payment.studentName}</Field>
            <Field label="Cédula o RIF">{payment.studentTaxId}</Field>
            <Field label="Correo">{payment.studentEmail}</Field>
          </dl>
        </Card>
      </div>

      <ReviewModal action={review} payment={payment} onClose={closeReview} onSubmit={applyReview} />
    </>
  );
}

interface ReviewModalProps {
  action: ReviewAction | null;
  payment: PaymentDetail;
  onClose: () => void;
  onSubmit: (action: ReviewAction, reason: string) => void;
}

/** Confirmar o rechazar a mano: el spec exige un motivo en cada acción manual. */
function ReviewModal({ action, payment, onClose, onSubmit }: ReviewModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isConfirm = action === 'confirm';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!action) return;
    if (reason.trim().length < REASON_MIN) {
      setError('Escribe el motivo: queda guardado en el historial del pago.');
      return;
    }
    onSubmit(action, reason.trim());
    setReason('');
    setError(null);
  }

  return (
    <Modal
      open={action !== null}
      title={isConfirm ? 'Confirmar pago' : 'Rechazar pago'}
      description={
        isConfirm
          ? `${payment.studentName} recibe acceso por 30 días desde hoy, o desde su vencimiento si sigue activo.`
          : `${payment.studentName} no recibe acceso por este pago y se le avisa por correo para que lo reintente.`
      }
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Motivo"
          error={error ?? undefined}
          hint="Queda en el historial del pago, con tu nombre y la hora."
          control={({ id, describedBy, invalid }) => (
            <textarea
              id={id}
              rows={3}
              placeholder={isConfirm ? 'Ej. Verifiqué el depósito en el banco.' : 'Ej. La referencia no aparece en el banco.'}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              className={cn(inputClasses, 'resize-y', invalid && 'border-red-500/60')}
            />
          )}
        />
        <div className="flex justify-end mt-2">
          {isConfirm ? (
            <Button type="submit" size="sm" variant="primary">
              Confirmar pago
            </Button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center h-10 px-4 rounded-[10px] bg-danger-strong text-white text-[13.5px] font-semibold hover:brightness-110 transition cursor-pointer"
            >
              Rechazar pago
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
