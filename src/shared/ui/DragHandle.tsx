import { cn } from '../lib/cn';

interface DragHandleProps {
  /** El mismo `scope` que se pasó a useDragReorder. */
  scope: string;
  /** Qué se arrastra, para el nombre accesible: "el módulo Análisis técnico". */
  label: string;
  className?: string;
}

/** Asa de seis puntos para arrastrar una fila. Solo desde aquí empieza el arrastre. */
export function DragHandle({ scope, label, className }: DragHandleProps) {
  return (
    <span
      data-drag-handle={scope}
      title="Arrastra para reordenar"
      aria-label={`Arrastrar ${label}`}
      className={cn(
        'flex items-center justify-center w-6 h-8 shrink-0 rounded-md text-subtle hover:text-accent cursor-grab active:cursor-grabbing transition-colors',
        className
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="9" cy="6" r="1.6" />
        <circle cx="15" cy="6" r="1.6" />
        <circle cx="9" cy="12" r="1.6" />
        <circle cx="15" cy="12" r="1.6" />
        <circle cx="9" cy="18" r="1.6" />
        <circle cx="15" cy="18" r="1.6" />
      </svg>
    </span>
  );
}
