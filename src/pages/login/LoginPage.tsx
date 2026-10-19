import { motion } from 'framer-motion';
import { useAuth } from '../../entities/session';
import { LoginForm } from '../../features/admin-login';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { FormAlert } from '../../shared/ui/FormAlert';
import { ROUTES } from '../../shared/config/routes';

export function LoginPage() {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth();

  return (
    <Container className="py-24 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center text-center"
      >
        <span className="block text-xs font-bold uppercase tracking-[3px] text-accent mb-4">
          Acceso privado
        </span>
        <h1 className="font-display font-bold text-[clamp(28px,4vw,38px)] text-ink mb-3">
          {isAdmin ? 'Panel de administrador' : 'Acceso de administración'}
        </h1>

        {isLoading ? (
          <p className="text-muted text-[15px]">Cargando…</p>
        ) : isAdmin ? (
          <>
            <p className="text-muted text-[15px] mb-8">
              Sesión iniciada como <span className="text-ink font-semibold">{user?.email}</span>.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button to={ROUTES.adminCourses} variant="primary" className="w-full">
                Editar cursos
              </Button>
              <Button to={ROUTES.adminOverview} variant="ghost" className="w-full">
                Ir al panel
              </Button>
              <button
                type="button"
                onClick={() => void logout()}
                className="mt-2 text-[13px] text-muted hover:text-accent transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : isAuthenticated ? (
          <>
            <div className="mb-8 w-full text-left">
              <FormAlert variant="error">
                La cuenta <strong>{user?.email}</strong> no tiene permisos de administración.
              </FormAlert>
            </div>
            <Button variant="ghost" onClick={() => void logout()} className="w-full">
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted text-[15px] mb-8">
              Introduce tus credenciales para editar el contenido del sitio.
            </p>
            <LoginForm />
          </>
        )}
      </motion.div>
    </Container>
  );
}
