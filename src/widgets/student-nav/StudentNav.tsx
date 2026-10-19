import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { ROUTES } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { cn } from '../../shared/lib/cn';

const LINKS = [
  { label: 'Inicio', to: ROUTES.student, end: true },
  { label: 'Cursos', to: ROUTES.studentCourses, end: false },
  { label: 'Mi cuenta', to: ROUTES.studentAccount, end: false },
];

const linkClasses = 'text-[12.5px] font-semibold tracking-[1.4px] uppercase transition-colors';

export function StudentNav() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-line">
        <Container className="flex items-center justify-between gap-5 h-[76px]">
          <Logo />
          <nav className="flex items-center gap-5 sm:gap-7">
            {LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(linkClasses, isActive ? 'text-accent' : 'text-[#c6cedb] hover:text-accent')
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to={ROUTES.adminOverview} className={cn(linkClasses, 'text-accent hover:underline')}>
                Dashboard
              </NavLink>
            )}
          </nav>
        </Container>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
