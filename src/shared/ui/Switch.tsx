import { cn } from '../lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Nombre accesible: "Publicar la clase Qué es una wallet". */
  label: string;
  /** Texto visible al lado; por defecto "Publicado" / "Borrador". */
  onText?: string;
  offText?: string;
  disabled?: boolean;
  className?: string;
}

/** Interruptor que muestra un estado y lo cambia con un toque. */
export function Switch({
  checked,
  onChange,
  label,
  onText = 'Publicado',
  offText = 'Borrador',
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-default', className)}
    >
      <span className={cn('text-[12.5px] whitespace-nowrap', checked ? 'text-ink-soft' : 'text-muted')}>
        {checked ? onText : offText}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-block w-10 h-[22px] shrink-0 rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-line-strong'
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] w-4 h-4 rounded-full transition-all duration-150',
            checked ? 'left-[21px] bg-ink-inverse' : 'left-[3px] bg-muted'
          )}
        />
      </span>
    </button>
  );
}
