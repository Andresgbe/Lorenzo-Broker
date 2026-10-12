import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { TextField } from '../../../shared/ui/TextField';
import { validateNewPassword, type NewPasswordErrors } from '../model/validation';

export function NewPasswordForm() {
  const { isAuthenticated, isLoading, updatePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateNewPassword({ password, confirmation });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const { error } = await updatePassword(password);

    if (error) {
      setIsSubmitting(false);
      setSubmitError(error);
      return;
    }

    // Cerramos la sesión de recuperación para que entre con la contraseña nueva.
    await logout();
    navigate(ROUTES.signIn, { replace: true, state: { passwordUpdated: true } });
  }

  if (isLoading) {
    return <p className="text-muted text-[14.5px] text-center">Comprobando el enlace…</p>;
  }

  // Sin sesión no hay nada que cambiar: el enlace venció, ya se usó, o se entró a pelo.
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-5">
        <FormAlert variant="error">
          Este enlace no es válido o ya venció. Los enlaces de recuperación se pueden usar una sola vez.
        </FormAlert>
        <Link
          to={ROUTES.forgotPassword}
          className="text-center text-[13.5px] text-accent hover:underline"
        >
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Nueva contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
        }}
        error={errors.password}
      />

      <TextField
        label="Repite la contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Escríbela otra vez"
        value={confirmation}
        onChange={(e) => {
          setConfirmation(e.target.value);
          setErrors((prev) => (prev.confirmation ? { ...prev, confirmation: undefined } : prev));
        }}
        error={errors.confirmation}
      />

      {submitError && <FormAlert variant="error">{submitError}</FormAlert>}

      <Button type="submit" variant="primary" className="mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
      </Button>
    </form>
  );
}
