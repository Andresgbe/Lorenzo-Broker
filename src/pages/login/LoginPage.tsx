import { motion } from 'framer-motion';
import { useAuth } from '../../entities/session';
import { LoginForm } from '../../features/admin-login';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';

export function LoginPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

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
          {isAuthenticated ? 'Panel de administrador' : 'Iniciar sesión'}
        </h1>

        {isLoading ? (
          <p className="text-muted text-[15px]">Cargando…</p>
        ) : isAuthenticated ? (
          <>
            <p className="text-muted text-[15px] mb-8">
              Sesión iniciada como <span className="text-ink font-semibold">{user?.email}</span>.
            </p>
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
