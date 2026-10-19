import { cn } from '../lib/cn';
import { EditableText } from './EditableText';
import { RichText } from './RichText';

export interface Paragraph {
  id: string;
  text: string;
}

interface EditableParagraphsProps {
  paragraphs: Paragraph[];
  editable: boolean;
  /** Clases de cada párrafo, en lectura y en edición. */
  paragraphClassName?: string;
  className?: string;
  onUpdate: (paragraphs: Paragraph[]) => void;
  onCommit: () => void;
  /** Cambia y guarda de una vez (agregar, quitar). */
  onReplace: (paragraphs: Paragraph[]) => void;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Lista de párrafos de una página. El admin los edita, quita y agrega en sitio. */
export function EditableParagraphs({
  paragraphs,
  editable,
  paragraphClassName,
  className,
  onUpdate,
  onCommit,
  onReplace,
}: EditableParagraphsProps) {
  if (!editable) {
    return (
      <div className={cn('grid gap-5', className)}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph.id} className={paragraphClassName}>
            <RichText text={paragraph.text} />
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-5', className)}>
      {paragraphs.map((paragraph, index) => (
        <div key={paragraph.id} className="flex items-start gap-2">
          <EditableText
            multiline
            label={`Párrafo ${index + 1}`}
            value={paragraph.text}
            onChange={(text) => onUpdate(paragraphs.map((item) => (item.id === paragraph.id ? { ...item, text } : item)))}
            onCommit={onCommit}
            className={paragraphClassName}
          />
          <button
            type="button"
            onClick={() => onReplace(paragraphs.filter((item) => item.id !== paragraph.id))}
            aria-label={`Quitar párrafo ${index + 1}`}
            className="mt-2 text-muted hover:text-red-400 transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onReplace([...paragraphs, { id: `p-${Date.now()}`, text: 'Nuevo párrafo' }])}
        className="self-start inline-flex items-center gap-2 text-[12.5px] font-semibold text-accent hover:underline cursor-pointer"
      >
        <PlusIcon className="w-4 h-4" />
        Agregar párrafo
      </button>
    </div>
  );
}
