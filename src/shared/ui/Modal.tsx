import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  /** Línea bajo el título, en muted. */
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Ventana centrada sobre la página oscurecida, para formularios cortos (cambiar
 * correo o contraseña). Se cierra con la X, con Escape o tocando el fondo; al
 * abrir, el foco va al primer campo. Para confirmar un borrado usa ConfirmDialog.
 */
export function Modal({ open, title, description, onClose, children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const firstField = panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-modal-close])');
    firstField?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    // La página de fondo no se desplaza mientras el modal está abierto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/60 backdrop-blur-[2px] overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[460px] my-auto bg-panel-2 border border-line-strong rounded-[18px] p-6 sm:p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
      >
        <button
          type="button"
          data-modal-close
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-[10px] border border-line-strong bg-panel text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <h2 id={titleId} className="font-display font-bold text-[21px] text-ink text-balance pr-12">
          {title}
        </h2>
        {description && <p className="text-[13.5px] leading-relaxed text-muted text-pretty mt-1.5 pr-12">{description}</p>}

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
