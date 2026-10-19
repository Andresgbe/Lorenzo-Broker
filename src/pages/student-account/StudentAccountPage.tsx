import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { DEMO_MEMBERSHIP, formatDate } from '../../entities/membership';
import { DEMO_PAYMENTS, PAYMENT_STATUS_TONE } from '../../entities/payment';
import { ACCOUNT_SECTIONS, ROUTES, studentAccountPath, type AccountSection } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { TextField } from '../../shared/ui/TextField';
import { StatusPill } from '../../shared/ui/StatusPill';

// Solo los pagos de este alumno. Con datos reales esto lo filtra la consulta, no el cliente.
const myPayments = DEMO_PAYMENTS.filter((payment) => payment.studentName === 'María Pérez');

const TABS: { section: AccountSection; label: string }[] = [
  { section: ACCOUNT_SECTIONS.profile, label: 'Datos personales' },
  { section: ACCOUNT_SECTIONS.membership, label: 'Membresía y pagos' },
  { section: ACCOUNT_SECTIONS.password, label: 'Contraseña' },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-panel border border-line rounded-[18px] p-6 sm:p-8">
      <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-6">{title}</h2>
      {children}
    </section>
  );
}

function ProfileSection() {
  const { user } = useAuth();
  return (
    <Card title="Datos personales">
      <div className="flex flex-col gap-4">
        <TextField label="Nombre y apellido" defaultValue={user?.fullName ?? ''} placeholder="Ej. María Pérez" />
        <TextField label="Correo electrónico" type="email" defaultValue={user?.email ?? ''} placeholder="nombre@ejemplo.com" />
        <TextField label="Cédula o RIF" defaultValue={user?.taxId ?? ''} placeholder="V-12345678" />
        <Button variant="primary" className="self-start mt-2">
          Guardar cambios
        </Button>
      </div>
    </Card>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MembershipSection() {
  // El historial va escondido: se abre con un botón pequeño debajo de la membresía.
  const [showPayments, setShowPayments] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Card title="Membresía">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-display font-bold text-[22px] text-ink">Plan {DEMO_MEMBERSHIP.planName}</p>
            <p className="text-muted text-[13.5px] mt-1.5">
              Vence el {formatDate(DEMO_MEMBERSHIP.expiresOn)} · <span className="text-accent font-semibold">Activa</span>
            </p>
          </div>
          <Button to={ROUTES.checkoutPlan} variant="ghost">
            Cambiar de plan
          </Button>
        </div>
      </Card>

      <button
        type="button"
        onClick={() => setShowPayments((value) => !value)}
        aria-expanded={showPayments}
        aria-controls="payment-history"
        className="self-start inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-accent transition-colors cursor-pointer"
      >
        {showPayments ? 'Ocultar historial de pagos' : 'Ver historial de pagos'}
        <ChevronIcon className={cn('w-4 h-4 transition-transform', showPayments && 'rotate-180')} />
      </button>

      {showPayments && (
        <section id="payment-history" className="bg-panel border border-line rounded-[18px] overflow-x-auto">
          <h2 className="px-6 sm:px-8 pt-6 pb-4 text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">Historial de pagos</h2>
          <table className="w-full min-w-[520px] text-[14px]">
            <thead>
              <tr className="border-y border-line text-left">
                {['Fecha', 'Plan', 'Método', 'Estado'].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-6 sm:first:pl-8 py-3.5 text-[10.5px] font-bold uppercase tracking-[1.8px] text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-line last:border-b-0">
                  <td className="px-6 sm:pl-8 py-3.5 text-[#c6cedb]">{formatDate(payment.date)}</td>
                  <td className="px-6 py-3.5 text-[#c6cedb]">{payment.planName}</td>
                  <td className="px-6 py-3.5 text-[#c6cedb]">{payment.method}</td>
                  <td className="px-6 py-3.5">
                    <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function PasswordSection() {
  return (
    <Card title="Cambiar contraseña">
      <div className="flex flex-col gap-4">
        <TextField label="Contraseña actual" type="password" autoComplete="current-password" placeholder="Tu contraseña" />
        <TextField label="Contraseña nueva" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" />
        <Button variant="primary" className="self-start mt-2">
          Actualizar contraseña
        </Button>
      </div>
      <p className="text-[12.5px] text-muted mt-5">
        ¿La olvidaste?{' '}
        <Link to={ROUTES.forgotPassword} className="text-accent hover:underline">
          Recupérala por correo
        </Link>
        .
      </p>
    </Card>
  );
}

export function StudentAccountPage() {
  const [params] = useSearchParams();
  const requested = params.get('seccion');
  const section = TABS.find((tab) => tab.section === requested)?.section ?? ACCOUNT_SECTIONS.profile;

  return (
    <Container className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink">Mi cuenta</h1>

        <nav aria-label="Secciones de tu cuenta" className="flex flex-wrap gap-2 mt-6 mb-8">
          {TABS.map((tab) => (
            <Link
              key={tab.section}
              to={studentAccountPath(tab.section)}
              aria-current={tab.section === section ? 'page' : undefined}
              className={cn(
                'px-4 py-2.5 rounded-full border text-[13px] font-semibold transition-colors',
                tab.section === section
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line text-muted hover:text-ink hover:border-line-strong',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {section === ACCOUNT_SECTIONS.profile && <ProfileSection />}
        {section === ACCOUNT_SECTIONS.membership && <MembershipSection />}
        {section === ACCOUNT_SECTIONS.password && <PasswordSection />}
      </div>
    </Container>
  );
}
