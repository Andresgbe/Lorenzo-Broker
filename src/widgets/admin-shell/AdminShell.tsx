import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { ROUTES } from '../../shared/config/routes';
import { Logo } from '../../shared/ui/Logo';
import { cn } from '../../shared/lib/cn';

const SECTIONS = [
  { label: 'Resumen', to: ROUTES.adminOverview },
  { label: 'Alumnos', to: ROUTES.adminStudents },
  { label: 'Pagos', to: ROUTES.adminPayments },
  { label: 'Cursos', to: ROUTES.adminCourses },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

/**
 * Marco del panel: barra superior fija con el menú hamburguesa (secciones,
 * cuenta, cerrar sesión). El contenido usa todo el ancho.
 */
export function AdminShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = SECTIONS.find((section) => pathname.startsWith(section.to));

  // Al navegar se cierra el menú: el estado se ajusta durante el render, sin efecto.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header ref={menuRef} className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line">
        <div className="flex items-center gap-4 h-16 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="admin-menu"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-[10px] border transition-colors cursor-pointer',
              open ? 'border-accent text-accent bg-accent/10' : 'border-line-strong text-ink bg-panel-2 hover:border-muted'
            )}
          >
            <MenuIcon open={open} />
          </button>

          <Logo />

          {current && (
            <span className="hidden sm:flex items-center gap-3 text-[13.5px]">
              <span aria-hidden="true" className="text-subtle">
                /
              </span>
              <span className="text-[#c6cedb]">Panel · {current.label}</span>
            </span>
          )}

          <div className="ml-auto flex items-center gap-4">
            {/* El admin ve los cursos como los ve un alumno (borradores incluidos). */}
            <Link
              to={ROUTES.studentCourses}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-line-strong text-[13.5px] font-semibold text-[#c6cedb] hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="hidden sm:inline">Vista de alumno</span>
              <span className="sm:hidden">Alumno</span>
            </Link>
            <span className="hidden lg:block text-[12.5px] text-muted truncate max-w-[220px]" title={user?.email}>
              {user?.email}
            </span>
          </div>
        </div>

        {open && (
          <div id="admin-menu" className="absolute left-4 sm:left-6 top-[calc(100%+8px)] w-[min(300px,calc(100vw-32px))] p-2 bg-panel-2 border border-line-strong rounded-[14px] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <nav aria-label="Secciones del panel" className="flex flex-col gap-0.5">
              {SECTIONS.map((section) => (
                <NavLink
                  key={section.label}
                  to={section.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3.5 py-3 rounded-[10px] text-[14px] transition-colors',
                      isActive ? 'bg-accent/10 text-accent font-semibold' : 'text-ink hover:bg-white/5'
                    )
                  }
                >
                  {section.label}
                </NavLink>
              ))}
            </nav>

            <div className="h-px bg-line mx-2 my-2" />

            <Link to={ROUTES.home} className="block px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-muted hover:text-ink hover:bg-white/5 transition-colors">
              Ver el sitio
            </Link>
            <p className="px-3.5 pt-2 text-[11.5px] text-muted truncate" title={user?.email}>
              {user?.email}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              className="w-full text-left px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 min-w-0 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
