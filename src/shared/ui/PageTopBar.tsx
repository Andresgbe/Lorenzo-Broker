import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  /** Sin `to`: es la página actual. */
  to?: string;
}

interface PageTopBarProps {
  /** A dónde lleva la flecha: el nivel de arriba. */
  backTo: string;
  backLabel: string;
  crumbs: Crumb[];
  /** Botones a la derecha (Button size="sm", MenuButton). */
  actions?: ReactNode;
}

/**
 * Encabezado de las páginas que tienen un nivel arriba, en el panel y en el área
 * del alumno: volver, ruta en texto plano y acciones. Sin caja ni fondo, para no
 * parecer una segunda barra. La ruta va en mayúsculas: CURSOS / CURSO / MÓDULO / CLASE.
 * En el panel se usa con su nombre de siempre, AdminTopBar (widgets/admin-shell).
 */
export function PageTopBar({ backTo, backLabel, crumbs, actions }: PageTopBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8">
      {/* En pantallas anchas la flecha cuelga en el margen izquierdo, fuera de la columna del contenido. */}
      <Link
        to={backTo}
        aria-label={backLabel}
        title={backLabel}
        className="flex items-center justify-center w-12 h-12 shrink-0 min-[1500px]:-ml-16 rounded-xl bg-panel-2 border border-line-strong text-ink hover:border-accent hover:text-accent transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>

      <nav aria-label="Ruta" className="flex-1 min-w-[160px]">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold uppercase tracking-[1.6px]">
          {crumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && (
                <li aria-hidden="true" className="text-subtle">
                  /
                </li>
              )}
              <li className="min-w-0 truncate max-w-[280px]">
                {crumb.to ? (
                  <Link to={crumb.to} className="text-muted hover:text-accent transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
