import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NOT_CONFIGURED, useAuth, type SignInRedirectState } from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { PasswordField } from '../../../shared/ui/PasswordField';
import { TextField } from '../../../shared/ui/TextField';
import { isValidEmail } from '../../../shared/lib/validation';

interface SignInLocationState extends Partial<SignInRedirectState> {
  justRegistered?: boolean;
  passwordUpdated?: boolean;
}

/** Solo rutas internas ("/alumno/..."): nunca "//otro-sitio" ni una URL completa. */
function safeReturnPath(from: string | undefined) {
  return from && from.startsWith('/') && !from.startsWith('//') ? from : null;
}

export function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: SignInLocationState | null };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setFieldError('Escribe un correo válido.');
      return;
    }
    setFieldError(null);

    setIsSubmitting(true);
    setSubmitError(null);
    const { error, role } = await login(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      // Mensaje genérico a propósito: no revelamos si el correo existe. Lo único
      // que se dice tal cual es que falta configurar Supabase, que no es de la cuenta.
      setSubmitError(error === NOT_CONFIGURED ? error : 'Correo o contraseña incorrectos.');
      return;
    }
    // Un solo login para todos: vuelve a la página pedida o, si no hay, el admin
    // va al panel y el alumno a su área.
    const fallback = role === 'admin' ? ROUTES.adminOverview : ROUTES.student;
    navigate(safeReturnPath(state?.from) ?? fallback, { replace: true });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {safeReturnPath(state?.from) && !state?.justRegistered && !state?.passwordUpdated && (
        <p className="text-[13.5px] text-muted">Inicia sesión para continuar.</p>
      )}

      {state?.justRegistered && (
        <FormAlert variant="success">
          Cuenta creada. Revisa tu correo para confirmarla y luego entra aquí.
        </FormAlert>
      )}

      {state?.passwordUpdated && (
        <FormAlert variant="success">
          Contraseña actualizada. Entra con la nueva.
        </FormAlert>
      )}

      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="nombre@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldError ?? undefined}
      />

      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="current-password"
        placeholder="Tu contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        labelAside={
          <Link to={ROUTES.forgotPassword} className="text-[12.5px] text-accent hover:underline">
            ¿La olvidaste?
          </Link>
        }
      />

      <Button type="submit" variant="primary" className="mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
      </Button>

      {submitError && <FormAlert variant="error">{submitError}</FormAlert>}
    </form>
  );
}
