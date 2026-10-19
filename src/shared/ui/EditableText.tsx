import { cn } from '../lib/cn';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  /** Se llama al salir del campo: ahí se guarda. */
  onCommit: () => void;
  /** Nombre accesible del campo, p. ej. "Título". */
  label: string;
  multiline?: boolean;
  /** Las mismas clases de tipografía y color que el texto que reemplaza. */
  className?: string;
}

/**
 * Campo de edición en sitio para el admin. Se ve como el texto que reemplaza,
 * con un borde inferior punteado que pasa a verde al enfocar.
 */
export function EditableText({ value, onChange, onCommit, label, multiline, className }: EditableTextProps) {
  const classes = cn(
    'w-full bg-transparent outline-none border-b border-dashed border-line focus:border-accent transition-colors',
    className
  );

  if (multiline) {
    return (
      <textarea
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCommit}
        rows={2}
        className={cn(classes, 'resize-none field-sizing-content')}
      />
    );
  }

  return (
    <input
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onCommit}
      className={classes}
    />
  );
}
