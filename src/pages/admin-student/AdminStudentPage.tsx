import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDate } from '../../entities/membership';
import { PAYMENT_STATUS_TONE, formatDateTimeCaracas, formatUsd, usePayments } from '../../entities/payment';
import { useAuth } from '../../entities/session';
import { ROLE_LABEL, STUDENT_STATUS_TONE, useStudent, type StudentAction } from '../../entities/student';
import { StudentActionModal, canManageStudent, canRevokeStudent, type StudentActionKind } from '../../features/manage-student';
import { ROUTES, adminPaymentPath } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { FormAlert } from '../../shared/ui/FormAlert';
import { MenuButton } from '../../shared/ui/MenuButton';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AdminTopBar } from '../../widgets/admin-shell';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-panel border border-line rounded-[18px] p-6 sm:p-7">
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

function describeAction({ action, details }: StudentAction) {
  if (action === 'grant_access') return `Dio ${details.days} días de acceso`;
  if (action === 'revoke_access') return 'Quitó el acceso';
  if (action === 'update_student') return 'Editó los datos';
  if (action === 'record_payment') {
    const months = Number(details.months);
    return `Registró un pago de ${formatUsd(Number(details.amount_usd_cents))} por ${months === 1 ? '1 mes' : `${months} meses`}`;
  }
  if (action === 'approve_payment_report') return 'Aprobó un pago reportado';
  if (action === 'reject_payment_report') return 'Rechazó un pago reportado';
  return action;
}

/** Detalle de un alumno: sus datos, su membresía, sus pagos y lo que los admins han hecho con su cuenta. */
export function AdminStudentPage() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const { student, actions, failed, isLoading, reload } = useStudent(studentId);
  const { payments, reload: reloadPayments } = usePayments(studentId);
  const [action, setAction] = useState<StudentActionKind | null>(null);

  if (isLoading) return <p className="text-muted text-[14px]">Cargando alumno…</p>;

  if (!student) {
    return (
      <>
        <AdminTopBar backTo={ROUTES.adminStudents} backLabel="Volver a alumnos" crumbs={[{ label: 'Alumnos', to: ROUTES.adminStudents }, { label: 'Alumno' }]} />
        {failed ? (
          <FormAlert variant="error">No pudimos cargar el alumno. Intenta de nuevo en un momento.</FormAlert>
        ) : (
          <div className="bg-panel border border-line rounded-[18px] p-8 text-center">
            <p className="text-[15px] text-ink">No encontramos ese alumno.</p>
            <p className="text-[13.5px] text-muted mt-1.5">Puede que el enlace esté mal escrito. Vuelve a la lista de alumnos.</p>
          </div>
        )}
      </>
    );
  }

  const name = student.name ?? student.email;
  const canManage = canManageStudent(student, user?.id);

  return (
    <>
      <AdminTopBar
        backTo={ROUTES.adminStudents}
        backLabel="Volver a alumnos"
        crumbs={[{ label: 'Alumnos', to: ROUTES.adminStudents }, { label: name }]}
        actions={
          <>
            {canManage && (
              <Button size="sm" variant="ghost" onClick={() => setAction('edit')}>
                Editar datos
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setAction('payment')}>
              Registrar pago
            </Button>
            <Button size="sm" variant="primary" onClick={() => setAction('grant')}>
              Dar o extender acceso
            </Button>
            {canRevokeStudent(student, user?.id) && (
              <MenuButton
                label={`Más acciones de ${name}`}
                items={[{ label: 'Quitar acceso', tone: 'danger', onSelect: () => setAction('revoke') }]}
              />
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-7">
        <h1 className="font-display font-bold text-[clamp(26px,3.4vw,34px)] text-ink text-balance">{name}</h1>
        {ROLE_LABEL[student.role] && <StatusPill tone="neutral">{ROLE_LABEL[student.role]}</StatusPill>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 items-start mb-5">
        <Card title="Datos">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre y apellido">{student.name ?? '—'}</Field>
            <Field label="Correo">{student.email}</Field>
            <Field label="Cédula o RIF">{student.taxId ?? '—'}</Field>
            <Field label="Teléfono (WhatsApp)">{student.phone ?? '—'}</Field>
          </dl>
        </Card>

        <Card title="Membresía">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Field label="Estado">
              <StatusPill tone={STUDENT_STATUS_TONE[student.status]}>{student.status}</StatusPill>
            </Field>
            <Field label="Plan">{student.planName ?? '—'}</Field>
            <Field label={student.status === 'Vencida' || student.status === 'En gracia' ? 'Venció el' : 'Vence el'}>
              {student.expiresOn ? formatDate(student.expiresOn) : '—'}
            </Field>
          </dl>
        </Card>
      </div>

      <div className="mb-5">
        <Card title="Pagos">
          {payments.length === 0 ? (
            <p className="text-[13.5px] text-muted">Todavía no tiene pagos registrados.</p>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:-mx-7">
              <table className="w-full min-w-[560px] text-[13.5px]">
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t border-line first:border-t-0">
                      <td className="px-6 sm:px-7 py-3 whitespace-nowrap">
                        <Link to={adminPaymentPath(payment.id)} className="text-ink hover:text-accent transition-colors">
                          {formatDate(payment.date)}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-ink whitespace-nowrap">{formatUsd(payment.amountUsdCents)}</td>
                      <td className="px-3 py-3 text-muted whitespace-nowrap">{payment.method ?? '—'}</td>
                      <td className="px-6 sm:px-7 py-3 text-right">
                        <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title="Historial">
        {actions.length === 0 ? (
          <p className="text-[13.5px] text-muted">Ningún administrador ha modificado esta cuenta.</p>
        ) : (
          <ol className="flex flex-col gap-5">
            {actions.map((item) => (
              <li key={item.id} className="min-w-0">
                <p className="text-[14px] text-ink">{describeAction(item)}</p>
                <p className="text-[12px] text-muted mt-0.5">
                  {formatDateTimeCaracas(item.at)}
                  {item.adminName && ` · ${item.adminName}`}
                </p>
                <p className="text-[13px] text-ink-soft mt-1.5">“{item.reason}”</p>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {action && (
        <StudentActionModal
          student={student}
          action={action}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            reload();
            reloadPayments();
          }}
        />
      )}
    </>
  );
}
