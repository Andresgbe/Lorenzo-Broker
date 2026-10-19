import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../entities/session';
import { ACCOUNT_SECTIONS, ROUTES, studentAccountPath } from '../../../shared/config/routes';
import { cn } from '../../../shared/lib/cn';

const ACCOUNT_LINKS = [
  { label: 'Mi área', to: ROUTES.student },
  { label: 'Mi cuenta', to: studentAccountPath(ACCOUNT_SECTIONS.profile) },
  { label: 'Membresía y pagos', to: studentAccountPath(ACCOUNT_SECTIONS.membership) },
  { label: 'Cambiar contraseña', to: studentAccountPath(ACCOUNT_SECTIONS.password) },
];

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

/** Iniciales del nombre; sin nombre, la primera letra del correo; sin sesión, null. */
function initialsOf(fullName: string | null | undefined, email: string | null | undefined) {
  const words = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return email ? email[0].toUpperCase() : null;
}

/**
 * Avatar redondo arriba a la derecha que abre el menú de la cuenta: nombre y
 * correo, Mi área, las secciones de Mi cuenta y Cerrar sesión. Va en la barra
 * del sitio (con sesión iniciada) y en la del área del alumno.
 */
export function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = initialsOf(user?.fullName, user?.email);

  // Al navegar se cierra el menú: el estado se ajusta durante el render, sin efecto.
  const location = pathname + search;
  const [lastLocation, setLastLocation] = useState(location);
  if (lastLocation !== location) {
    setLastLocation(location);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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
    // Primero a la home: si cerrara la sesión antes, RequireAuth mandaría a iniciar sesión.
    navigate(ROUTES.home);
    await logout();
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={open ? 'Cerrar menú de tu cuenta' : 'Abrir menú de tu cuenta'}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full border text-[13px] font-bold transition-colors cursor-pointer',
          open ? 'border-accent bg-accent/10 text-accent' : 'border-line-strong bg-panel-2 text-ink hover:border-accent'
        )}
      >
        {initials ?? <UserIcon className="w-5 h-5" />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] w-[min(260px,calc(100vw-32px))] p-2 bg-panel-2 border border-line-strong rounded-[14px] shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        >
          {user ? (
            <div className="px-3.5 pt-2 pb-3">
              <p className="text-[14px] font-semibold text-ink truncate">{user.fullName || 'Tu cuenta'}</p>
              <p className="text-[12px] text-muted truncate" title={user.email ?? undefined}>
                {user.email}
              </p>
            </div>
          ) : (
            <p className="px-3.5 pt-2 pb-3 text-[13px] text-muted">No has iniciado sesión.</p>
          )}

          <div className="h-px bg-line mx-2 mb-1.5" />

          {user ? (
            <>
              {ACCOUNT_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  role="menuitem"
                  className="block px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-ink hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-line mx-2 my-1.5" />
              <button
                type="button"
                role="menuitem"
                onClick={() => void handleLogout()}
                className="w-full text-left px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to={ROUTES.signIn}
              role="menuitem"
              className="block px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-accent hover:bg-white/5 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
