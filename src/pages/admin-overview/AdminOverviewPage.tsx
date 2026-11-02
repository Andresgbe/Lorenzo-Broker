import type { ReactNode } from 'react';
import { useStudents } from '../../entities/student';
import { PAYMENT_STATUS_TONE, formatUsd, usePayments } from '../../entities/payment';
import { caracasDay, formatDate } from '../../entities/membership';
import { ROUTES } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { FormAlert } from '../../shared/ui/FormAlert';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AdminPageHeading } from '../../widgets/admin-shell';

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-panel border border-line rounded-[18px] overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line">
        <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminOverviewPage() {
  const { students, isLoading: isLoadingStudents, error: studentsError } = useStudents();
  const { payments, isLoading: isLoadingPayments, error: paymentsError } = usePayments();
  const error = studentsError ?? paymentsError;

  if (error) {
    return (
      <>
        <AdminPageHeading title="Resumen" />
        <FormAlert variant="error">No pudimos cargar el resumen. Intenta de nuevo en un momento.</FormAlert>
      </>
    );
  }
  if (isLoadingStudents || isLoadingPayments) {
    return (
      <>
        <AdminPageHeading title="Resumen" />
        <p className="text-muted text-[14px]">Cargando resumen…</p>
      </>
    );
  }

  const withAccess = students.filter((student) => ['Activa', 'Por vencer', 'En gracia'].includes(student.status));
  const expiringSoon = students.filter((student) => student.status === 'Por vencer');
  const pendingPayments = payments.filter((payment) => payment.status === 'En verificación' || payment.status === 'Monto por revisar');
  // El mes se compara en hora de Caracas: YYYY-MM.
  const thisMonth = caracasDay(new Date()).slice(0, 7);
  const collectedCents = payments
    .filter((payment) => payment.status === 'Pagado' && payment.paidAt && caracasDay(payment.paidAt).startsWith(thisMonth))
    .reduce((total, payment) => total + payment.amountUsdCents, 0);

  const tiles = [
    { label: 'Alumnos activos', value: String(withAccess.length) },
    { label: 'Cobrado este mes', value: formatUsd(collectedCents) },
    { label: 'Vencen pronto', value: String(expiringSoon.length) },
    { label: 'Pagos en verificación', value: String(pendingPayments.length) },
  ];

  return (
    <>
      <AdminPageHeading title="Resumen" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-panel border border-line rounded-[18px] p-5">
            <p className="text-[11.5px] uppercase tracking-[1.6px] text-muted">{tile.label}</p>
            <p className="font-display font-bold text-[30px] text-ink mt-2 leading-none">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2 items-start">
        <Panel
          title="Últimos pagos"
          action={
            <Button to={ROUTES.adminPayments} variant="ghost" size="sm">
              Ver todos
            </Button>
          }
        >
          {payments.length === 0 ? (
            <p className="px-5 py-6 text-[13.5px] text-muted">Todavía no hay pagos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[13.5px]">
                <tbody>
                  {payments.slice(0, 5).map((payment) => (
                    <tr key={payment.id} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3 text-ink">{payment.studentName ?? 'Alumno sin datos'}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{formatUsd(payment.amountUsdCents)}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(payment.date)}</td>
                      <td className="px-5 py-3 text-right">
                        <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title="Membresías por vencer"
          action={
            <Button to={ROUTES.adminStudents} variant="ghost" size="sm">
              Ver alumnos
            </Button>
          }
        >
          {expiringSoon.length === 0 ? (
            <p className="px-5 py-6 text-[13.5px] text-muted">Ninguna vence pronto.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-[13.5px]">
                <tbody>
                  {expiringSoon.map((student) => (
                    <tr key={student.id} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3 text-ink">{student.name ?? student.email}</td>
                      <td className="px-5 py-3 text-muted truncate max-w-[180px]">{student.email}</td>
                      <td className="px-5 py-3 text-gold whitespace-nowrap text-right">
                        {student.expiresOn && formatDate(student.expiresOn)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
