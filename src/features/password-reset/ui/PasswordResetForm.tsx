import { useState, type FormEvent } from 'react';
import { useAuth } from '../../../entities/session';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { TextField } from '../../../shared/ui/TextField';
import { isValidEmail } from '../../../shared/lib/validation';

export function PasswordResetForm() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
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
    const { error } = await requestPasswordReset(email.trim());
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }
    setIsSent(true);
  }

  // Confirmamos el envío sin decir si el correo existe.
  if (isSent) {
    return (
      <FormAlert variant="success">
        Si hay una cuenta con ese correo, te llegará un enlace en unos minutos. Revisa también el spam.
      </FormAlert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="nombre@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldError ?? undefined}
      />

      {submitError && <FormAlert variant="error">{submitError}</FormAlert>}

      <Button type="submit" variant="primary" className="mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
      </Button>
    </form>
  );
}
