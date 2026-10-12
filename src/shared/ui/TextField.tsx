import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Contenido alineado a la derecha de la etiqueta, p. ej. "¿Lo olvidaste?". */
  labelAside?: ReactNode;
  hint?: string;
  error?: string;
  /** Reemplaza el <input> por un control compuesto (ver IdentityField). */
  control?: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

export const inputClasses =
  'w-full bg-bg-2 border border-line rounded-[10px] px-3.5 py-2.5 text-[15px] text-ink ' +
  'placeholder:text-muted/50 transition-colors focus:outline-none focus:border-accent';

export function TextField({ label, labelAside, hint, error, control, className, ...inputProps }: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] text-[#c6cedb]">
          {label}
        </label>
        {labelAside}
      </div>

      {control ? (
        control({ id, describedBy, invalid: Boolean(error) })
      ) : (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(inputClasses, error && 'border-red-500/60', className)}
          {...inputProps}
        />
      )}

      {hint && !error && (
        <p id={hintId} className="text-[11.5px] leading-snug text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[11.5px] leading-snug text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
