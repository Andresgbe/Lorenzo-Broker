import { Link } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { DEMO_MEMBERSHIP, formatDate } from '../../entities/membership';
import { DEMO_PAYMENTS, PAYMENT_STATUS_TONE } from '../../entities/payment';
import { ROUTES } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { TextField } from '../../shared/ui/TextField';
import { StatusPill } from '../../shared/ui/StatusPill';

// Solo los pagos de este alumno. Con datos reales esto lo filtra la consulta, no el cliente.
const myPayments = DEMO_PAYMENTS.filter((payment) => payment.studentName === 'María Pérez');

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-panel border border-line rounded-[18px] p-6">
      <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-5">{title}</h2>
      {children}
    </section>
  );
}

export function StudentAccountPage() {
  const { user, logout } = useAuth();

  return (
    <Container className="py-12 md:py-16">
      <div className="flex items-center justify-between gap-5">
        <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink">Mi cuenta</h1>
        <button
          type="button"
          onClick={() => void logout()}
          className="text-[13px] text-muted hover:text-accent transition-colors cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 mt-9 items-start">
        <Card title="Datos personales">
          <div className="flex flex-col gap-4">
            <TextField label="Nombre y apellido" defaultValue={user?.fullName ?? ''} placeholder="Ej. María Pérez" />
            <TextField label="Correo electrónico" type="email" defaultValue={user?.email ?? ''} placeholder="nombre@ejemplo.com" />
            <TextField label="Cédula o RIF" defaultValue={user?.taxId ?? ''} placeholder="V-12345678" />
            <Button variant="primary" className="self-start mt-1">
              Guardar cambios
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Membresía">
            <p className="font-display font-bold text-[22px] text-ink">Plan {DEMO_MEMBERSHIP.planName}</p>
            <p className="text-muted text-[13.5px] mt-1.5">
              Vence el {formatDate(DEMO_MEMBERSHIP.expiresOn)} ·{' '}
              <span className="text-accent font-semibold">Activa</span>
            </p>
            <Button to={ROUTES.checkoutPlan} variant="ghost" className="mt-5">
              Cambiar de plan
            </Button>
          </Card>

          <Card title="Cambiar contraseña">
            <div className="flex flex-col gap-4">
              <TextField label="Contraseña actual" type="password" autoComplete="current-password" placeholder="Tu contraseña" />
              <TextField label="Contraseña nueva" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" />
              <Button variant="ghost" className="self-start mt-1">
                Actualizar contraseña
              </Button>
            </div>
            <p className="text-[12px] text-muted mt-4">
              ¿La olvidaste?{' '}
              <Link to={ROUTES.forgotPassword} className="text-accent hover:underline">
                Recupérala por correo
              </Link>
              .
            </p>
          </Card>
        </div>
      </div>

      <h2 className="font-display font-bold text-[20px] text-ink mt-12 mb-5">Historial de pagos</h2>

      <div className="bg-panel border border-line rounded-[18px] overflow-x-auto">
        <table className="w-full min-w-[520px] text-[14px]">
          <thead>
            <tr className="border-b border-line text-left">
              {['Fecha', 'Plan', 'Método', 'Estado'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-[1.8px] text-muted"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myPayments.map((payment) => (
              <tr key={payment.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3.5 text-[#c6cedb]">{formatDate(payment.date)}</td>
                <td className="px-5 py-3.5 text-[#c6cedb]">{payment.planName}</td>
                <td className="px-5 py-3.5 text-[#c6cedb]">{payment.method}</td>
                <td className="px-5 py-3.5">
                  <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
