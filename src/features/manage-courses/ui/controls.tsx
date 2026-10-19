import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
import { cn } from '../../../shared/lib/cn';

export function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

interface DeleteButtonProps {
  /** Título del diálogo: "¿Eliminar este PDF?". */
  title: string;
  /** Qué se pierde: "Los alumnos dejan de poder descargarlo. No se puede deshacer." */
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<unknown>;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Enlace "Eliminar" que abre la ventana de confirmación. */
export function DeleteButton({ title, description, confirmLabel, onConfirm, disabled, className, children }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  async function handleConfirm() {
    setIsBusy(true);
    try {
      await onConfirm();
    } finally {
      setIsBusy(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={cn('text-[13px] text-red-400 hover:underline cursor-pointer disabled:opacity-40', className)}
      >
        {children ?? 'Eliminar'}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setOpen(false)}
        isBusy={isBusy}
      />
    </>
  );
}
