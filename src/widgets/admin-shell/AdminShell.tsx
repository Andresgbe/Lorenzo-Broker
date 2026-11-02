import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { ADMIN_SECTIONS as SECTIONS, ROUTES } from '../../shared/config/routes';
import { Logo } from '../../shared/ui/Logo';
import { AccountMenu } from '../../features/account-menu';
import { cn } from '../../shared/lib/cn';

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
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

function SidebarIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

const SECTION_ICONS: Record<(typeof SECTIONS)[number]['to'], ReactNode> = {
  [ROUTES.adminOverview]: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="11" width="8" height="10" rx="1.5" />
      <rect x="3" y="14" width="8" height="7" rx="1.5" />
    </>
  ),
  [ROUTES.adminStudents]: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      <path d="M16 4.3a4 4 0 0 1 0 7.4" />
      <path d="M18.5 14.5c2 .9 3.5 3.2 3.5 6.5" />
    </>
  ),
  [ROUTES.adminPayments]: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ),
  [ROUTES.adminCourses]: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
    </>
  ),
};

// Preferencia de este navegador: quien minimiza el menú lo encuentra igual al volver.
const COLLAPSED_KEY = 'lb:admin-sidebar-collapsed';

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Marco del panel: barra superior fija y menú lateral siempre abierto, que se minimiza a solo
 * íconos con su flecha. En el teléfono no cabe: se abre con la hamburguesa, encima del contenido.
 */
export function AdminShell() {
  const { user, logout, setViewAsStudent } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const current = SECTIONS.find((section) => pathname.startsWith(section.to));

  // Al navegar se cierra el menú del teléfono: el estado se ajusta durante el render, sin efecto.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setIsMobileOpen(false);
  }

  useEffect(() => {
    if (!isMobileOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsMobileOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isMobileOpen]);

  function toggleCollapsed() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      if (next) window.localStorage.setItem(COLLAPSED_KEY, '1');
      else window.localStorage.removeItem(COLLAPSED_KEY);
    } catch {
      // Sin almacenamiento (modo privado): vale solo para esta pestaña.
    }
  }

  // El texto se oculta al minimizar solo desde lg: en el teléfono el menú siempre va completo.
  const labelClass = cn('truncate', isCollapsed && 'lg:hidden');
  const itemLayout = cn('flex items-center gap-3 rounded-[10px] px-3 transition-colors', isCollapsed && 'lg:justify-center lg:px-0');

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line">
        <div className="flex items-center gap-4 h-[76px] w-full px-4 sm:px-5">
          <button
            type="button"
            onClick={() => setIsMobileOpen((value) => !value)}
            aria-expanded={isMobileOpen}
            aria-controls="admin-sidebar"
            aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className={cn(
              'lg:hidden flex items-center justify-center w-10 h-10 shrink-0 rounded-[10px] border transition-colors cursor-pointer',
              isMobileOpen ? 'border-accent text-accent bg-accent/10' : 'border-line-strong text-ink bg-panel-2 hover:border-muted',
            )}
          >
            <MenuIcon open={isMobileOpen} />
          </button>

          <Logo />

          {current && (
            <span className="hidden sm:flex items-center gap-3 text-[13.5px]">
              <span aria-hidden="true" className="text-subtle">
                /
              </span>
              <span className="text-ink-soft">{current.label}</span>
            </span>
          )}

          <div className="ml-auto flex items-center gap-4">
            {/* Enciende la Vista de alumno: el panel desaparece hasta apagarla desde el avatar. */}
            <button
              type="button"
              onClick={() => {
                setViewAsStudent(true);
                navigate(ROUTES.student);
              }}
              className="cursor-pointer inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-line-strong text-[13.5px] font-semibold text-ink-soft hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="hidden sm:inline">Vista de alumno</span>
              <span className="sm:hidden">Alumno</span>
            </button>
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {isMobileOpen && (
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 top-[76px] z-30 bg-black/60 cursor-default"
          />
        )}

        <aside
          id="admin-sidebar"
          className={cn(
            'fixed left-0 bottom-0 top-[76px] z-40 flex flex-col w-[260px] p-3 bg-panel border-r border-line overflow-y-auto transition-[transform,width] duration-200',
            'lg:sticky lg:bottom-auto lg:h-[calc(100dvh-76px)] lg:shrink-0 lg:translate-x-0',
            isMobileOpen ? 'translate-x-0' : 'max-lg:-translate-x-full max-lg:invisible',
            isCollapsed && 'lg:w-[72px]',
          )}
        >
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls="admin-sidebar"
            aria-label={isCollapsed ? 'Expandir menú' : 'Minimizar menú'}
            title={isCollapsed ? 'Expandir menú' : 'Minimizar menú'}
            className={cn(
              'hidden lg:flex items-center justify-center w-10 h-10 mb-2 shrink-0 rounded-[10px] border border-line-strong text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer',
              isCollapsed ? 'self-center' : 'self-end',
            )}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={cn('transition-transform', isCollapsed && 'rotate-180')}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <nav aria-label="Secciones del panel" className="flex flex-col gap-1">
            {SECTIONS.map((section) => (
              <NavLink
                key={section.label}
                to={section.to}
                title={isCollapsed ? section.label : undefined}
                aria-label={section.label}
                className={({ isActive }) =>
                  cn(
                    itemLayout,
                    'h-11 text-[14px]',
                    isActive ? 'bg-accent/10 text-accent font-semibold' : 'text-ink hover:bg-white/5',
                  )
                }
              >
                <SidebarIcon>{SECTION_ICONS[section.to]}</SidebarIcon>
                <span className={labelClass}>{section.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-3 flex flex-col gap-1">
            <div className="h-px bg-line mx-2 mb-2" />
            <Link
              to={ROUTES.home}
              title={isCollapsed ? 'Ver el sitio' : undefined}
              aria-label="Ver el sitio"
              className={cn(itemLayout, 'h-10 text-[13.5px] text-muted hover:text-ink hover:bg-white/5')}
            >
              <SidebarIcon>
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
              </SidebarIcon>
              <span className={labelClass}>Ver el sitio</span>
            </Link>
            <p className={cn('px-3 pt-1 text-[11.5px] text-muted', labelClass)} title={user?.email}>
              {user?.email}
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              title={isCollapsed ? 'Cerrar sesión' : undefined}
              aria-label="Cerrar sesión"
              className={cn(itemLayout, 'h-10 w-full text-left text-[13.5px] text-red-400 hover:bg-white/5 cursor-pointer')}
            >
              <SidebarIcon>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </SidebarIcon>
              <span className={labelClass}>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
