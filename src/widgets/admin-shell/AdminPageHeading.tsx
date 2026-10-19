import type { ReactNode } from 'react';

interface AdminPageHeadingProps {
  title: string;
  /** Botón o acción alineada a la derecha. */
  action?: ReactNode;
}

export function AdminPageHeading({ title, action }: AdminPageHeadingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
      <div>
        <h1 className="font-display font-bold text-[clamp(24px,3vw,30px)] text-ink">{title}</h1>
        <p className="text-muted text-[12.5px] mt-1.5">
          Datos de ejemplo — todavía no están conectados a la base de datos.
        </p>
      </div>
      {action}
    </div>
  );
}
