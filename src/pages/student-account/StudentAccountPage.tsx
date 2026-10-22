import { useCallback, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { DEMO_MEMBERSHIP, formatDate } from '../../entities/membership';
import { DEMO_PAYMENTS, PAYMENT_STATUS_TONE } from '../../entities/payment';
import { ACCOUNT_SECTIONS, ROUTES, studentAccountPath, type AccountSection, type BackLinkState } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { Modal } from '../../shared/ui/Modal';
import { PasswordField } from '../../shared/ui/PasswordField';
import { TextField } from '../../shared/ui/TextField';
import { StatusPill } from '../../shared/ui/StatusPill';

// Solo los pagos de este alumno. Con datos reales esto lo filtra la consulta, no el cliente.
const myPayments = DEMO_PAYMENTS.filter((payment) => payment.studentName === 'María Pérez');

const TABS: { section: AccountSection; label: string }[] = [
  { section: ACCOUNT_SECTIONS.profile, label: 'Datos personales' },
  { section: ACCOUNT_SECTIONS.membership, label: 'Membresía y pagos' },
  { section: ACCOUNT_SECTIONS.security, label: 'Seguridad' },
];

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-panel border border-line rounded-[18px] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Los datos se leen primero; "Editar" abre el formulario. El correo no se edita aquí:
// se cambia en la pestaña Seguridad, porque exige confirmarlo por correo.
// Todavía no se guarda en Supabase: "Guardar cambios" solo actualiza la vista.
function ProfileSection() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<ProfileValues>(() => ({
    fullName: user?.fullName ?? '',
    taxId: user?.taxId ?? '',
    phone: user?.phone ?? '',
  }));
  const [draft, setDraft] = useState<ProfileValues>(saved);
  const [isEditing, setIsEditing] = useState(false);

  function startEditing() {
    setDraft(saved);
    setIsEditing(true);
  }

  function save(event: FormEvent) {
    event.preventDefault();
    setSaved({ fullName: draft.fullName.trim(), taxId: draft.taxId.trim(), phone: draft.phone.trim() });
    setIsEditing(false);
  }

  return (
    <Card
      title="Datos personales"
      action={
        !isEditing && (
          <Button size="sm" variant="ghost" onClick={startEditing}>
            <PencilIcon className="w-4 h-4" />
            Editar
          </Button>
        )
      }
    >
      {isEditing ? (
        <form onSubmit={save} noValidate className="flex flex-col gap-4">
          <TextField
            label="Nombre y apellido"
            autoComplete="name"
            placeholder="Ej. María Pérez"
            value={draft.fullName}
            onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))}
          />
          <TextField
            label="Cédula o RIF"
            placeholder="V-12345678"
            value={draft.taxId}
            onChange={(e) => setDraft((prev) => ({ ...prev, taxId: e.target.value }))}
          />
          <TextField
            label="Teléfono (WhatsApp)"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0414-1234567"
            value={draft.phone}
            onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-ink-soft">Correo electrónico</span>
            <p className="text-[15px] text-muted">{user?.email}</p>
            <p className="text-[11.5px] leading-snug text-muted">
              Se cambia en{' '}
              <Link to={studentAccountPath(ACCOUNT_SECTIONS.security)} className="text-accent hover:underline">
                la pestaña Seguridad
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 mt-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" variant="primary">
              Guardar cambios
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-5 sm:grid-cols-2">
          <InfoRow label="Nombre y apellido" value={saved.fullName} />
          <InfoRow label="Correo electrónico" value={user?.email ?? ''} />
          <InfoRow label="Cédula o RIF" value={saved.taxId} />
          <InfoRow label="Teléfono (WhatsApp)" value={saved.phone} />
        </dl>
      )}
    </Card>
  );
}

interface ProfileValues {
  fullName: string;
  taxId: string;
  phone: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-[12.5px] text-muted">{label}</dt>
      <dd className={cn('text-[15px] break-words', value ? 'text-ink' : 'text-muted italic')}>{value || 'Sin agregar'}</dd>
    </div>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
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
                  <td className="px-6 sm:pl-8 py-3.5 text-ink-soft">{formatDate(payment.date)}</td>
                  <td className="px-6 py-3.5 text-ink-soft">{payment.planName}</td>
                  <td className="px-6 py-3.5 text-ink-soft">{payment.method}</td>
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

type SecurityOption = 'password' | 'email';

// Seguridad de la cuenta: correo y contraseña. Cada opción abre su formulario en un
// modal, no dentro de la tarjeta. Todavía no se guarda en Supabase.
function SecuritySection() {
  const { user } = useAuth();
  const [open, setOpen] = useState<SecurityOption | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <Card title="Seguridad">
      <div className="flex flex-col divide-y divide-line">
        <SecurityRow
          title="Correo electrónico"
          description={user?.email ?? ''}
          actionLabel="Cambiar correo"
          onAction={() => setOpen('email')}
        />
        <SecurityRow
          title="Contraseña"
          description="La que usas para entrar a tu cuenta."
          actionLabel="Cambiar contraseña"
          onAction={() => setOpen('password')}
        />
      </div>

      <Modal
        open={open === 'email'}
        title="Cambiar correo"
        description={
          <>
            Tu correo actual es <span className="text-ink-soft">{user?.email}</span>.
          </>
        }
        onClose={close}
      >
        <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
          <TextField label="Correo nuevo" type="email" autoComplete="email" placeholder="nombre@ejemplo.com" />
          <PasswordField
            label="Contraseña actual"
            autoComplete="current-password"
            placeholder="Para confirmar que eres tú"
            hint="Te enviaremos un enlace al correo nuevo. El cambio se aplica cuando lo abras."
          />
          <ModalActions submitLabel="Cambiar correo" />
        </form>
      </Modal>

      <Modal open={open === 'password'} title="Cambiar contraseña" onClose={close}>
        <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
          <PasswordField
            label="Contraseña actual"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            labelAside={
              <Link
                to={ROUTES.forgotPassword}
                state={{ from: studentAccountPath(ACCOUNT_SECTIONS.security), fromTitle: 'Mi cuenta' } satisfies BackLinkState}
                className="text-[12.5px] text-accent hover:underline"
              >
                ¿La olvidaste?
              </Link>
            }
          />
          <PasswordField label="Contraseña nueva" autoComplete="new-password" placeholder="Mínimo 8 caracteres" />
          <PasswordField label="Confirmar contraseña nueva" autoComplete="new-password" placeholder="Repite la contraseña nueva" />
          <ModalActions submitLabel="Actualizar contraseña" />
        </form>
      </Modal>
    </Card>
  );
}

interface SecurityRowProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function SecurityRow({ title, description, actionLabel, onAction }: SecurityRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <p className="text-[13.5px] text-muted mt-0.5 break-words">{description}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

/** Pie de los formularios en modal: solo la acción principal, a la derecha. Se cancela con la X del modal. */
function ModalActions({ submitLabel }: { submitLabel: string }) {
  return (
    <div className="flex justify-end mt-2">
      <Button type="submit" size="sm" variant="primary">
        {submitLabel}
      </Button>
    </div>
  );
}

export function StudentAccountPage() {
  const [params] = useSearchParams();
  // Direcciones viejas: ?seccion=clave (Cambiar contraseña) y ?seccion=configuracion hoy abren Seguridad.
  const raw = params.get('seccion');
  const requested = raw === 'clave' || raw === 'configuracion' ? ACCOUNT_SECTIONS.security : raw;
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
        {section === ACCOUNT_SECTIONS.security && <SecuritySection />}
      </div>
    </Container>
  );
}
