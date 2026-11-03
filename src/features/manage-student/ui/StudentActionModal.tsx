import { useState, type FormEvent } from 'react';
import { formatDate } from '../../../entities/membership';
import { MAIN_PLAN, PLANS, findPlan } from '../../../entities/plan';
import { useAuth } from '../../../entities/session';
import { STUDENT_STATUS_TONE, expireAccess, grantAccess, recordPayment, revokeAccess, updateStudent, type Student } from '../../../entities/student';
import { PAYMENT_METHODS } from '../../../shared/config/payment-methods';
import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { Modal } from '../../../shared/ui/Modal';
import { StatusPill } from '../../../shared/ui/StatusPill';
import { TextField, inputClasses } from '../../../shared/ui/TextField';
import { canExpireStudent, canRevokeStudent } from '../model/studentMenu';
import { parseAmountToCents, reasonError } from '../model/validation';

export type StudentActionKind = 'edit' | 'access' | 'payment';

interface StudentActionModalProps {
  student: Student;
  action: StudentActionKind;
  onClose: () => void;
  /** Ya guardado: la pantalla recarga sus datos. */
  onDone: () => void;
}

const MONTHS = [1, 2, 3, 6, 12];

function monthsLabel(months: number) {
  return months === 1 ? '1 mes' : `${months} meses`;
}

function ReasonField({ value, error, placeholder, onChange }: { value: string; error?: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <TextField
      label="Motivo"
      error={error}
      hint="Queda en el historial del alumno, con tu nombre y la hora."
      control={({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={3}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClasses, 'resize-y', invalid && 'border-red-500/60')}
        />
      )}
    />
  );
}

/** Estado común: guardar, mostrar el error y avisar al terminar. */
function useSubmit(onDone: () => void) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: () => Promise<void>) {
    setIsBusy(true);
    setError(null);
    try {
      await action();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intenta de nuevo en un momento.');
      setIsBusy(false);
    }
  }

  return { isBusy, error, submit };
}

function EditForm({ student, onDone }: Pick<StudentActionModalProps, 'student' | 'onDone'>) {
  const [fullName, setFullName] = useState(student.name ?? '');
  const [taxId, setTaxId] = useState(student.taxId ?? '');
  const [phone, setPhone] = useState(student.phone ?? '');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; reason?: string }>({});
  const { isBusy, error, submit } = useSubmit(onDone);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      fullName: fullName.trim().length < 3 ? 'Escribe su nombre y apellido.' : undefined,
      reason: reasonError(reason),
    };
    setErrors(next);
    if (next.fullName || next.reason) return;
    void submit(() => updateStudent(student.id, { fullName: fullName.trim(), taxId: taxId.trim(), phone: phone.trim() }, reason.trim()));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Nombre y apellido"
        value={fullName}
        error={errors.fullName}
        onChange={(event) => {
          setFullName(event.target.value);
          setErrors((prev) => ({ ...prev, fullName: undefined }));
        }}
      />
      <TextField label="Cédula o RIF" placeholder="V-12345678" value={taxId} onChange={(event) => setTaxId(event.target.value)} />
      <TextField label="Teléfono (WhatsApp)" type="tel" placeholder="0414-1234567" value={phone} onChange={(event) => setPhone(event.target.value)} />
      <ReasonField
        value={reason}
        error={errors.reason}
        placeholder="Ej. Me pidió corregir su cédula por WhatsApp."
        onChange={(value) => {
          setReason(value);
          setErrors((prev) => ({ ...prev, reason: undefined }));
        }}
      />
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <div className="flex justify-end mt-2">
        <Button type="submit" size="sm" variant="primary" disabled={isBusy}>
          {isBusy ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

function GrantForm({ student, submitLabel, onDone }: Pick<StudentActionModalProps, 'student' | 'onDone'> & { submitLabel: string }) {
  const [plan, setPlan] = useState(findPlan(student.planId) ?? MAIN_PLAN);
  const [days, setDays] = useState(String(plan.durationDays));
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ days?: string; reason?: string }>({});
  const { isBusy, error, submit } = useSubmit(onDone);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(days);
    const next = {
      days: Number.isInteger(parsed) && parsed >= 1 && parsed <= 3650 ? undefined : 'Escribe un número de días entre 1 y 3650.',
      reason: reasonError(reason),
    };
    setErrors(next);
    if (next.days || next.reason) return;
    void submit(() => grantAccess(student.id, plan.id, parsed, reason.trim()));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Tipo de membresía"
        control={({ id }) => (
          <select
            id={id}
            value={plan.id}
            onChange={(event) => {
              const next = findPlan(event.target.value) ?? MAIN_PLAN;
              setPlan(next);
              setDays(String(next.durationDays));
              setErrors((prev) => ({ ...prev, days: undefined }));
            }}
            className={inputClasses}
          >
            {PLANS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        )}
      />
      <TextField
        label="Días de acceso"
        inputMode="numeric"
        value={days}
        error={errors.days}
        onChange={(event) => {
          setDays(event.target.value);
          setErrors((prev) => ({ ...prev, days: undefined }));
        }}
      />
      <ReasonField
        value={reason}
        error={errors.reason}
        placeholder="Ej. Cortesía por un problema con su pago."
        onChange={(value) => {
          setReason(value);
          setErrors((prev) => ({ ...prev, reason: undefined }));
        }}
      />
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <div className="flex justify-end mt-2">
        <Button type="submit" size="sm" variant="primary" disabled={isBusy}>
          {isBusy ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function PaymentForm({ student, onDone }: Pick<StudentActionModalProps, 'student' | 'onDone'>) {
  const [plan, setPlan] = useState(findPlan(student.planId) ?? MAIN_PLAN);
  const [months, setMonths] = useState(1);
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [amountUsd, setAmountUsd] = useState(String(plan.price));
  const [amountBs, setAmountBs] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ amountUsd?: string; amountBs?: string; reason?: string }>({});
  const { isBusy, error, submit } = useSubmit(onDone);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const usdCents = parseAmountToCents(amountUsd);
    const bsCents = amountBs.trim() ? parseAmountToCents(amountBs) : null;
    const next = {
      amountUsd: usdCents === null ? 'Escribe el monto en dólares, por ejemplo 29 o 29,50.' : undefined,
      amountBs: amountBs.trim() && bsCents === null ? 'Escribe el monto en bolívares, por ejemplo 6245,73.' : undefined,
      reason: reasonError(reason),
    };
    setErrors(next);
    if (next.amountUsd || next.amountBs || next.reason || usdCents === null) return;
    void submit(() =>
      recordPayment(
        student.id,
        { planId: plan.id, months: plan.period === 'year' ? 1 : months, amountUsdCents: usdCents, amountBsCents: bsCents, method, reference: reference.trim() },
        reason.trim()
      )
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Plan"
          control={({ id }) => (
            <select
              id={id}
              value={plan.id}
              onChange={(event) => {
                const next = findPlan(event.target.value) ?? MAIN_PLAN;
                setPlan(next);
                setMonths(1);
                setAmountUsd(String(next.price));
              }}
              className={inputClasses}
            >
              {PLANS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          )}
        />
        {plan.period === 'month' && (
          <TextField
            label="Meses pagados"
            control={({ id }) => (
              <select
                id={id}
                value={months}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setMonths(next);
                  setAmountUsd(String(plan.price * next));
                }}
                className={inputClasses}
              >
                {MONTHS.map((option) => (
                  <option key={option} value={option}>
                    {monthsLabel(option)}
                  </option>
                ))}
              </select>
            )}
          />
        )}
        <TextField
          label="Método"
          control={({ id }) => (
            <select id={id} value={method} onChange={(event) => setMethod(event.target.value)} className={inputClasses}>
              {PAYMENT_METHODS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        />
        <TextField
          label="Monto en dólares"
          inputMode="decimal"
          value={amountUsd}
          error={errors.amountUsd}
          onChange={(event) => {
            setAmountUsd(event.target.value);
            setErrors((prev) => ({ ...prev, amountUsd: undefined }));
          }}
        />
        <TextField
          label="Monto en bolívares (opcional)"
          inputMode="decimal"
          value={amountBs}
          error={errors.amountBs}
          onChange={(event) => {
            setAmountBs(event.target.value);
            setErrors((prev) => ({ ...prev, amountBs: undefined }));
          }}
        />
      </div>
      <TextField label="Referencia (opcional)" placeholder="Ej. 001234567890" value={reference} onChange={(event) => setReference(event.target.value)} />
      <ReasonField
        value={reason}
        error={errors.reason}
        placeholder="Ej. Verifiqué el depósito en el banco."
        onChange={(value) => {
          setReason(value);
          setErrors((prev) => ({ ...prev, reason: undefined }));
        }}
      />
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <div className="flex justify-end mt-2">
        <Button type="submit" size="sm" variant="primary" disabled={isBusy}>
          {isBusy ? 'Guardando…' : 'Registrar pago'}
        </Button>
      </div>
    </form>
  );
}

interface ReasonOnlyFormProps {
  submitLabel: string;
  placeholder: string;
  action: (reason: string) => Promise<void>;
  onDone: () => void;
}

/** Una acción que solo pide el motivo, con el botón en rojo: expirar o quitar el acceso. */
function ReasonOnlyForm({ submitLabel, placeholder, action, onDone }: ReasonOnlyFormProps) {
  const [reason, setReason] = useState('');
  const [reasonMessage, setReasonMessage] = useState<string>();
  const { isBusy, error, submit } = useSubmit(onDone);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = reasonError(reason);
    setReasonMessage(message);
    if (message) return;
    void submit(() => action(reason.trim()));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ReasonField
        value={reason}
        error={reasonMessage}
        placeholder={placeholder}
        onChange={(value) => {
          setReason(value);
          setReasonMessage(undefined);
        }}
      />
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex items-center h-10 px-4 rounded-[10px] bg-danger-strong text-white text-[13.5px] font-semibold hover:brightness-110 transition cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          {isBusy ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

type AccessOption = 'grant' | 'expire' | 'revoke';

/** Todo lo del acceso en un solo lugar: el estado actual y lo que se puede hacer con él. */
function AccessPanel({ student, onDone }: Pick<StudentActionModalProps, 'student' | 'onDone'>) {
  const { user } = useAuth();
  const hasAccess = ['Activa', 'Por vencer', 'En gracia'].includes(student.status);
  const options: { id: AccessOption; label: string; note: string }[] = [
    {
      id: 'grant',
      label: hasAccess ? 'Extender' : 'Activar',
      note: hasAccess ? 'Suma días a su vencimiento. No registra un pago.' : 'Le da acceso desde hoy. No registra un pago.',
    },
  ];
  if (canExpireStudent(student, user?.id)) {
    options.push({ id: 'expire', label: 'Expirar', note: 'Termina ahora, sin días de gracia. Queda como Expirada y puede renovar.' });
  }
  if (canRevokeStudent(student, user?.id)) {
    options.push({ id: 'revoke', label: 'Quitar', note: 'Deja de ver los cursos de inmediato. Su cuenta y sus pagos se mantienen.' });
  }
  const [selected, setSelected] = useState<AccessOption>('grant');
  const current = options.find((option) => option.id === selected) ?? options[0];

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-panel p-4 text-[13px]">
        <div className="min-w-0">
          <dt className="text-muted mb-1">Estado</dt>
          <dd>
            <StatusPill tone={STUDENT_STATUS_TONE[student.status]}>{student.status}</StatusPill>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted mb-1">Plan</dt>
          <dd className="text-ink-soft break-words">{student.planName ?? '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted mb-1">Vencimiento</dt>
          <dd className="text-ink-soft">{student.expiresOn ? formatDate(student.expiresOn) : '—'}</dd>
        </div>
      </dl>

      <div role="radiogroup" aria-label="Qué hacer con el acceso" className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
              current.id === option.id ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/40'
            )}
          >
            <input
              type="radio"
              name="access-option"
              value={option.id}
              checked={current.id === option.id}
              onChange={() => setSelected(option.id)}
              className="w-4 h-4 mt-0.5 accent-accent cursor-pointer shrink-0"
            />
            <span className="min-w-0">
              <span className="block text-[14px] text-ink">{option.label}</span>
              <span className="block text-[12px] text-muted mt-0.5">{option.note}</span>
            </span>
          </label>
        ))}
      </div>

      {current.id === 'grant' && <GrantForm key="grant" student={student} submitLabel={hasAccess ? 'Extender acceso' : 'Activar acceso'} onDone={onDone} />}
      {current.id === 'expire' && (
        <ReasonOnlyForm
          key="expire"
          submitLabel="Expirar acceso"
          placeholder="Ej. Terminó su período de cortesía."
          action={(reason) => expireAccess(student.id, reason)}
          onDone={onDone}
        />
      )}
      {current.id === 'revoke' && (
        <ReasonOnlyForm
          key="revoke"
          submitLabel="Quitar acceso"
          placeholder="Ej. Devolución del pago."
          action={(reason) => revokeAccess(student.id, student.planId ?? MAIN_PLAN.id, reason)}
          onDone={onDone}
        />
      )}
    </div>
  );
}

/** Las acciones manuales sobre un alumno. Todas piden un motivo, que queda en admin_actions. */
export function StudentActionModal({ student, action, onClose, onDone }: StudentActionModalProps) {
  const name = student.name ?? student.email;
  const content = {
    edit: {
      title: 'Editar datos',
      description: `Datos de ${name}. El correo no se cambia aquí.`,
      form: <EditForm student={student} onDone={onDone} />,
    },
    access: {
      title: 'Administrar acceso',
      description: name,
      form: <AccessPanel student={student} onDone={onDone} />,
    },
    payment: {
      title: 'Registrar pago',
      description: `Para un pago que ya recibiste de ${name}. Queda como pagado y extiende su acceso por el período pagado.`,
      form: <PaymentForm student={student} onDone={onDone} />,
    },
  }[action];

  return (
    <Modal open title={content.title} description={content.description} onClose={onClose}>
      {content.form}
    </Modal>
  );
}
