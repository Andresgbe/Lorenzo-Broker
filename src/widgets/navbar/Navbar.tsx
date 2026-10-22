import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { ADMIN_SECTIONS, ROUTES } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { AccountMenu } from '../../features/account-menu';
import { SubscribeButton } from '../../features/subscribe-cta';

interface NavLinkItem {
  label: string;
  to: string;
}

const navLinks: NavLinkItem[] = [
  { label: 'Sobre mí', to: ROUTES.about },
  { label: 'Preguntas', to: ROUTES.faq },
  { label: 'Mentoría 1:1', to: ROUTES.mentorship },
];

// Iniciar sesión y Registrarte no van en la barra: los ofrece el avatar (AccountMenu).

const navLinkClasses = 'hover:text-accent transition-colors text-[12.5px] font-semibold tracking-[1.4px] uppercase text-ink-soft';

// El menú hamburguesa es el mismo del panel (AdminShell): mismas clases, y para el admin
// las mismas secciones. Gatea en isAdmin, nunca en isAuthenticated.
const menuItemClasses = 'flex items-center justify-between px-3.5 py-3 rounded-[10px] text-[14px] transition-colors';
const menuItemState = ({ isActive }: { isActive: boolean }) =>
  cn(menuItemClasses, isActive ? 'bg-accent/10 text-accent font-semibold' : 'text-ink hover:bg-white/5');

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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAdmin, isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

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

  async function handleLogout() {
    setOpen(false);
    navigate(ROUTES.home);
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-line">
      <Container className="flex items-center justify-between gap-4 h-[76px]">
        <div className="flex items-center gap-4 min-w-0">
          {/* Desde 1400px el botón sale de la columna y queda en la esquina; antes no cabe sin pisar el logo.
              Desde lg solo hace falta para el admin: los enlaces del sitio ya están en la barra. */}
          <div
            ref={menuRef}
            className={cn(
              'relative shrink-0 min-[1400px]:absolute min-[1400px]:left-5 min-[1400px]:top-1/2 min-[1400px]:-translate-y-1/2',
              !isAdmin && 'lg:hidden',
            )}
          >
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-[10px] border transition-colors cursor-pointer',
                open ? 'border-accent text-accent bg-accent/10' : 'border-line-strong text-ink bg-panel-2 hover:border-muted',
              )}
            >
              <MenuIcon open={open} />
            </button>

            {open && (
              // top: 8px por debajo de la barra (76px), igual que en el panel.
              <div
                id="site-menu"
                className="absolute left-0 top-[calc(100%+26px)] w-[min(300px,calc(100vw-32px))] p-2 bg-panel-2 border border-line-strong rounded-[14px] shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              >
                {isAdmin && (
                  <nav aria-label="Secciones del panel" className="flex flex-col gap-0.5">
                    {ADMIN_SECTIONS.map((section) => (
                      <NavLink key={section.label} to={section.to} className={menuItemState}>
                        {section.label}
                      </NavLink>
                    ))}
                  </nav>
                )}

                {/* Para el admin los enlaces del sitio ya están en la barra desde lg. */}
                <div className={cn(isAdmin && 'lg:hidden')}>
                  {isAdmin && <div className="h-px bg-line mx-2 my-2" />}
                  <nav aria-label="Secciones del sitio" className="flex flex-col gap-0.5">
                    {navLinks.map((link) => (
                      <NavLink key={link.label} to={link.to} end className={menuItemState}>
                        {link.label}
                      </NavLink>
                    ))}
                  </nav>
                </div>

                {isAuthenticated && (
                  <>
                    <div className="h-px bg-line mx-2 my-2" />
                    <p className="px-3.5 pt-2 text-[11.5px] text-muted truncate" title={user?.email ?? undefined}>
                      {user?.email}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="w-full text-left px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <Logo />
        </div>

        <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className={navLinkClasses}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* En teléfonos no cabe junto al logo; la portada ya muestra el botón grande. */}
          <SubscribeButton className="!hidden sm:!inline-flex" />
          <AccountMenu />
        </div>
      </Container>
    </header>
  );
}
