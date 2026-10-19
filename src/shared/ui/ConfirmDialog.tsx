import { useEffect, useRef, type ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** Texto del botón que cancela. Por defecto "Cancelar"; al descartar cambios, "Seguir editando". */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isBusy?: boolean;
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
    </svg>
  );
}

/**
 * Confirmación de una acción destructiva: diálogo centrado sobre la página
 * oscurecida. El foco empieza en "Cancelar"; Escape y el fondo también cancelan.
 */
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = 'Cancelar', onConfirm, onCancel, isBusy }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/60 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onCancel();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !isBusy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-[420px] bg-panel-2 border border-line-strong rounded-[18px] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] flex flex-col gap-3"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
          <TrashIcon className="w-[18px] h-[18px]" />
        </span>
        <h2 id="confirm-dialog-title" className="font-display font-bold text-[21px] text-ink text-balance">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="text-[13.5px] leading-relaxed text-muted text-pretty">
          {description}
        </p>
        <div className="flex flex-wrap justify-end gap-2 mt-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="inline-flex items-center h-10 px-4 rounded-[10px] border border-line-strong text-[13.5px] text-[#c6cedb] hover:text-ink hover:border-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="inline-flex items-center h-10 px-4 rounded-[10px] bg-danger-strong text-white text-[13.5px] font-semibold hover:brightness-110 transition cursor-pointer disabled:opacity-50"
          >
            {isBusy ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
