import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { AccountMenu } from '../../features/account-menu';
import { ROUTES } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { cn } from '../../shared/lib/cn';

const LINKS = [
  { label: 'Inicio', to: ROUTES.student, end: true },
  { label: 'Cursos', to: ROUTES.studentCourses, end: false },
];

// Mi cuenta ya no va en la barra: se abre desde el avatar (AccountMenu).
const linkClasses = 'text-[12.5px] font-semibold tracking-[1.4px] uppercase transition-colors';

export function StudentNav() {
  const { isAdminAccount, viewAsStudent, setViewAsStudent } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-line">
        <Container className="flex items-center justify-between gap-5 h-[76px]">
          <Logo />
          <div className="flex items-center gap-5 sm:gap-7">
            <nav className="flex items-center gap-5 sm:gap-7">
              {LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(linkClasses, isActive ? 'text-accent' : 'text-ink-soft hover:text-accent')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            {/* Un admin en Vista de alumno vuelve al panel con este botón (el espejo del de AdminShell). */}
            {isAdminAccount && viewAsStudent && (
              <button
                type="button"
                onClick={() => {
                  setViewAsStudent(false);
                  navigate(ROUTES.adminOverview);
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
                  <rect x="3" y="3" width="7" height="9" rx="1.5" />
                  <rect x="14" y="3" width="7" height="5" rx="1.5" />
                  <rect x="14" y="12" width="7" height="9" rx="1.5" />
                  <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
                <span className="hidden sm:inline">Vista de administrador</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}
            <AccountMenu />
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
