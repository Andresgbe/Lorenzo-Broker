import { useState, type FormEvent } from 'react';
import { useAuth } from '../../../entities/session';
import { cn } from '../../../shared/lib/cn';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { TextField, inputClasses } from '../../../shared/ui/TextField';
import {
  CONTACT_TOPICS,
  EMPTY_CONTACT_VALUES,
  MESSAGE_MAX,
  sendContactMessage,
  validateContact,
  type ContactErrors,
  type ContactTopic,
  type ContactValues,
} from '../model/contact';

export function ContactForm() {
  const { user } = useAuth();
  // Con sesión iniciada, nombre, correo y teléfono vienen rellenos (y se pueden cambiar).
  const [values, setValues] = useState<ContactValues>(() => ({
    ...EMPTY_CONTACT_VALUES,
    name: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  }));
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const { error } = await sendContactMessage(values);
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }
    setSent(true);
    setValues((prev) => ({ ...prev, topic: EMPTY_CONTACT_VALUES.topic, message: '' }));
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-5">
        <FormAlert variant="success">
          Recibí tu mensaje. Te respondo a <strong>{values.email.trim()}</strong> lo antes posible.
        </FormAlert>
        <Button type="button" size="sm" variant="ghost" onClick={() => setSent(false)}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid items-start gap-4 sm:grid-cols-2 sm:gap-x-5">
      <TextField
        label="Nombre"
        name="name"
        autoComplete="name"
        placeholder="Ej. María Pérez"
        value={values.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
      />

      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="nombre@ejemplo.com"
        value={values.email}
        onChange={(e) => set('email', e.target.value)}
        error={errors.email}
      />

      <TextField
        label="Teléfono (opcional)"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0414-1234567"
        hint="Si prefieres que te escriba por WhatsApp."
        value={values.phone}
        onChange={(e) => set('phone', e.target.value)}
        error={errors.phone}
      />

      <TextField
        label="Motivo"
        control={({ id, describedBy }) => (
          <select
            id={id}
            name="topic"
            aria-describedby={describedBy}
            value={values.topic}
            onChange={(e) => set('topic', e.target.value as ContactTopic)}
            className={cn(inputClasses, 'cursor-pointer')}
          >
            {CONTACT_TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value} className="bg-bg-2">
                {topic.label}
              </option>
            ))}
          </select>
        )}
      />

      <div className="sm:col-span-2">
        <TextField
          label="Mensaje"
          error={errors.message}
          hint={`${values.message.length} / ${MESSAGE_MAX}`}
          control={({ id, describedBy, invalid }) => (
            <textarea
              id={id}
              name="message"
              rows={6}
              maxLength={MESSAGE_MAX}
              placeholder="Cuéntame tu duda, tu sugerencia o qué está pasando con tu cuenta."
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={values.message}
              onChange={(e) => set('message', e.target.value)}
              className={cn(inputClasses, 'resize-y min-h-[140px]', invalid && 'border-red-500/60')}
            />
          )}
        />
      </div>

      {submitError && (
        <div className="sm:col-span-2">
          <FormAlert variant="error">{submitError}</FormAlert>
        </div>
      )}

      <Button type="submit" variant="primary" className="mt-1 w-full sm:col-span-2 sm:w-auto sm:justify-self-end" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
      </Button>
    </form>
  );
}
