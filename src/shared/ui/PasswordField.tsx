import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { TextField, inputClasses } from './TextField';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string;
  labelAside?: ReactNode;
  hint?: string;
  error?: string;
}

/** TextField de contraseña con botón para mostrarla u ocultarla. */
export function PasswordField({ label, labelAside, hint, error, className, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      labelAside={labelAside}
      hint={hint}
      error={error}
      control={({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id}
            type={visible ? 'text' : 'password'}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={cn(inputClasses, 'pr-12', invalid && 'border-red-500/60', className)}
            {...inputProps}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[10px] text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:text-accent"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      )}
    />
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.6" />
      <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
