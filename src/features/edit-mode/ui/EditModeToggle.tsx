import { useEditMode } from '../model/edit-mode-context';

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Botón flotante "Editar" / "Listo". Solo lo ve un admin. */
export function EditModeToggle() {
  const { canEdit, isEditing, setEditing } = useEditMode();
  if (!canEdit) return null;

  return (
    <button
      type="button"
      onClick={() => setEditing(!isEditing)}
      aria-pressed={isEditing}
      className={
        'fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold ' +
        'shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
        (isEditing
          ? 'bg-accent text-ink-inverse hover:brightness-110'
          : 'border border-line-strong bg-panel text-ink hover:bg-panel-2')
      }
    >
      {isEditing ? <CheckIcon /> : <PencilIcon />}
      {isEditing ? 'Listo' : 'Editar'}
    </button>
  );
}
