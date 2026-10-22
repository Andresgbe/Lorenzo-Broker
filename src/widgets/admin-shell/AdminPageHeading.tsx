import type { ReactNode } from 'react';

interface AdminPageHeadingProps {
  title: string;
  /** Botón o acción alineada a la derecha. */
  action?: ReactNode;
  /** Línea opcional bajo el título. */
  subtitle?: ReactNode;
  /** Migas de pan o enlace de vuelta, encima del título. */
  breadcrumb?: ReactNode;
}

export function AdminPageHeading({ title, action, subtitle, breadcrumb }: AdminPageHeadingProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
      <div className="min-w-0">
        {breadcrumb && <div className="text-[12.5px] text-muted mb-2">{breadcrumb}</div>}
        <h1 className="font-display font-bold text-[clamp(24px,3vw,30px)] text-ink text-balance">{title}</h1>
        {subtitle && <p className="text-muted text-[12.5px] mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
