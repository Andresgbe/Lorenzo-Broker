import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { ROUTES } from '../../shared/config/routes';
import { Logo } from '../../shared/ui/Logo';
import { cn } from '../../shared/lib/cn';

const SECTIONS = [
  { label: 'Resumen', to: ROUTES.adminOverview },
  { label: 'Alumnos', to: ROUTES.adminStudents },
  { label: 'Pagos', to: ROUTES.adminPayments },
  { label: 'Contenido', to: ROUTES.adminContent },
];

export function AdminShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-bg">
      <aside className="lg:w-[232px] lg:shrink-0 lg:min-h-dvh border-b lg:border-b-0 lg:border-r border-line bg-bg-2 flex flex-col">
        <div className="px-5 h-[76px] flex items-center border-b border-line">
          <Logo />
        </div>

        <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto">
          {SECTIONS.map((section) => (
            <NavLink
              key={section.label}
              to={section.to}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-2.5 rounded-lg text-[13.5px] whitespace-nowrap transition-colors',
                  isActive ? 'bg-accent/10 text-accent font-semibold' : 'text-[#c6cedb] hover:bg-panel'
                )
              }
            >
              {section.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden lg:block p-3 border-t border-line">
          <p className="px-3.5 text-[11.5px] text-muted truncate" title={user?.email}>
            {user?.email}
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-2 w-full text-left px-3.5 py-2 rounded-lg text-[13px] text-muted hover:text-accent hover:bg-panel transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-5 sm:px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
}
