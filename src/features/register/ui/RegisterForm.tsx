import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import { Button } from '../../../shared/ui/Button';
import { FormAlert } from '../../../shared/ui/FormAlert';
import { PasswordField } from '../../../shared/ui/PasswordField';
import { TextField, inputClasses } from '../../../shared/ui/TextField';
import { cn } from '../../../shared/lib/cn';
import {
  EMPTY_REGISTER_VALUES,
  TAX_ID_PREFIXES,
  formatTaxId,
  validateRegister,
  type RegisterErrors,
  type RegisterValues,
  type TaxIdPrefix,
} from '../model/validation';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterValues>(EMPTY_REGISTER_VALUES);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set<K extends keyof RegisterValues>(key: K, value: RegisterValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const { error } = await register({
      email: values.email.trim(),
      password: values.password,
      fullName: values.fullName.trim(),
      taxId: formatTaxId(values),
    });
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }
    navigate(ROUTES.signIn, { replace: true, state: { justRegistered: true } });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid items-start gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-5">
      <TextField
        label="Nombre y apellido"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Ej. María Pérez"
        value={values.fullName}
        onChange={(e) => set('fullName', e.target.value)}
        error={errors.fullName}
      />

      <TextField
        label="Cédula o RIF"
        hint="La pide la pasarela de pago para registrar tu cobro."
        error={errors.taxIdNumber}
        control={({ id, describedBy, invalid }) => (
          <div className="flex gap-2">
            <select
              aria-label="Tipo de documento"
              value={values.taxIdPrefix}
              onChange={(e) => set('taxIdPrefix', e.target.value as TaxIdPrefix)}
              className={cn(inputClasses, 'w-[72px] shrink-0 cursor-pointer')}
            >
              {TAX_ID_PREFIXES.map((prefix) => (
                <option key={prefix} value={prefix} className="bg-bg-2">
                  {prefix}
                </option>
              ))}
            </select>
            <input
              id={id}
              name="taxId"
              type="text"
              inputMode="numeric"
              placeholder="12345678"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={values.taxIdNumber}
              onChange={(e) => set('taxIdNumber', e.target.value.replace(/\D/g, ''))}
              className={cn(inputClasses, invalid && 'border-red-500/60')}
            />
          </div>
        )}
      />

      <div className="md:col-span-2">
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
      </div>

      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        value={values.password}
        onChange={(e) => set('password', e.target.value)}
        error={errors.password}
      />

      <PasswordField
        label="Confirmar contraseña"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repite tu contraseña"
        value={values.confirmPassword}
        onChange={(e) => set('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
      />

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="flex items-start gap-2.5 text-[13px] text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={values.acceptedTerms}
            onChange={(e) => set('acceptedTerms', e.target.checked)}
            aria-invalid={errors.acceptedTerms ? true : undefined}
            className="mt-0.5 w-4 h-4 accent-accent cursor-pointer shrink-0"
          />
          <span>
            Acepto los{' '}
            <Link to={ROUTES.home} className="text-accent hover:underline">
              términos y condiciones
            </Link>
            .
          </span>
        </label>
        {errors.acceptedTerms && (
          <p className="text-[11.5px] leading-snug text-red-400">{errors.acceptedTerms}</p>
        )}
      </div>

      {submitError && (
        <div className="md:col-span-2">
          <FormAlert variant="error">{submitError}</FormAlert>
        </div>
      )}

      <Button type="submit" variant="primary" className="mt-1 w-full md:col-span-2 md:w-[340px] md:justify-self-center" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
