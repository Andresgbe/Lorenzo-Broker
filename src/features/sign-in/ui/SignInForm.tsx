import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { TextField } from '../../../shared/ui/TextField';
import { isValidEmail } from '../../../shared/lib/validation';

interface SignInLocationState {
  justRegistered?: boolean;
  passwordUpdated?: boolean;
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
    const { error } = await login(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      // Mensaje genérico a propósito: no revelamos si el correo existe.
      setSubmitError('Correo o contraseña incorrectos.');
      return;
    }
    navigate(ROUTES.home, { replace: true });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

      <TextField
        label="Contraseña"
        name="password"
        type="password"
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
