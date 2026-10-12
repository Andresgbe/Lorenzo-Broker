import { Link } from 'react-router-dom';
import { DEMO_STUDENTS } from '../../entities/student';
import { DEMO_PAYMENTS, PAYMENT_STATUS_TONE } from '../../entities/payment';
import { PRICE_PLACEHOLDER } from '../../entities/plan';
import { formatDate } from '../../entities/membership';
import { ROUTES } from '../../shared/config/routes';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AdminPageHeading } from '../../widgets/admin-shell';

const expiringSoon = DEMO_STUDENTS.filter((student) => student.status === 'Por vencer');
const pendingPayments = DEMO_PAYMENTS.filter((payment) => payment.status === 'En verificación');

const TILES = [
  { label: 'Alumnos activos', value: String(DEMO_STUDENTS.filter((s) => s.status === 'Activa').length) },
  { label: 'Cobrado este mes', value: `$${PRICE_PLACEHOLDER}` },
  { label: 'Vencen pronto', value: String(expiringSoon.length) },
  { label: 'Pagos en verificación', value: String(pendingPayments.length) },
];

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
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
  return (
    <>
      <AdminPageHeading title="Resumen" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {TILES.map((tile) => (
          <div key={tile.label} className="bg-panel border border-line rounded-[18px] p-5">
            <p className="text-[11.5px] uppercase tracking-[1.6px] text-muted">{tile.label}</p>
            <p className="font-display font-extrabold text-[30px] text-ink mt-2 leading-none">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2 items-start">
        <Panel
          title="Últimos pagos"
          action={
            <Link to={ROUTES.adminPayments} className="text-[12.5px] text-accent hover:underline">
              Ver todos
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-[13.5px]">
              <tbody>
                {DEMO_PAYMENTS.slice(0, 5).map((payment) => (
                  <tr key={payment.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3 text-ink">{payment.studentName}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">${PRICE_PLACEHOLDER}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(payment.date)}</td>
                    <td className="px-5 py-3 text-right">
                      <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          title="Membresías por vencer"
          action={
            <Link to={ROUTES.adminStudents} className="text-[12.5px] text-accent hover:underline">
              Ver alumnos
            </Link>
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
                      <td className="px-5 py-3 text-ink">{student.name}</td>
                      <td className="px-5 py-3 text-muted truncate max-w-[180px]">{student.email}</td>
                      <td className="px-5 py-3 text-gold whitespace-nowrap text-right">
                        {formatDate(student.expiresOn)}
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
