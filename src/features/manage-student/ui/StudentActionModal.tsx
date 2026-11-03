import { useState, type FormEvent } from 'react';
import { MAIN_PLAN, PLANS, findPlan } from '../../../entities/plan';
import { grantAccess, recordPayment, revokeAccess, updateStudent, type Student } from '../../../entities/student';
import { PAYMENT_METHODS } from '../../../shared/config/payment-methods';
import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { Modal } from '../../../shared/ui/Modal';
import { TextField, inputClasses } from '../../../shared/ui/TextField';
import { parseAmountToCents, reasonError } from '../model/validation';

export type StudentActionKind = 'edit' | 'grant' | 'payment' | 'revoke';

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

function GrantForm({ student, onDone }: Pick<StudentActionModalProps, 'student' | 'onDone'>) {
  const [days, setDays] = useState('30');
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
    void submit(() => grantAccess(student.id, student.planId ?? MAIN_PLAN.id, parsed, reason.trim()));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {isBusy ? 'Guardando…' : 'Dar acceso'}
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

function RevokeForm({ student, onDone }: Pick<StudentActionModalProps, 'student' | 'onDone'>) {
  const [reason, setReason] = useState('');
  const [reasonMessage, setReasonMessage] = useState<string>();
  const { isBusy, error, submit } = useSubmit(onDone);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = reasonError(reason);
    setReasonMessage(message);
    if (message) return;
    void submit(() => revokeAccess(student.id, student.planId ?? MAIN_PLAN.id, reason.trim()));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ReasonField
        value={reason}
        error={reasonMessage}
        placeholder="Ej. Devolución del pago."
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
          {isBusy ? 'Guardando…' : 'Quitar acceso'}
        </button>
      </div>
    </form>
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
    grant: {
      title: 'Dar o extender acceso',
      description: `Si ${name} sigue activo, los días se suman a su vencimiento; si no, cuentan desde hoy. No registra un pago.`,
      form: <GrantForm student={student} onDone={onDone} />,
    },
    payment: {
      title: 'Registrar pago',
      description: `Para un pago que ya recibiste de ${name}. Queda como pagado y extiende su acceso por el período pagado.`,
      form: <PaymentForm student={student} onDone={onDone} />,
    },
    revoke: {
      title: 'Quitar acceso',
      description: `${name} deja de ver los cursos de inmediato, aunque su membresía no haya vencido. Su cuenta y sus pagos se mantienen.`,
      form: <RevokeForm student={student} onDone={onDone} />,
    },
  }[action];

  return (
    <Modal open title={content.title} description={content.description} onClose={onClose}>
      {content.form}
    </Modal>
  );
}
