interface RichTextProps {
  text: string;
  strongClassName?: string;
}

/** Texto plano donde `**palabra**` se resalta. Es todo el formato que admite el contenido editable. */
export function RichText({ text, strongClassName = 'text-ink font-semibold' }: RichTextProps) {
  // Con un grupo de captura, split deja en las posiciones impares lo que iba entre **.
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className={strongClassName}>
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}
