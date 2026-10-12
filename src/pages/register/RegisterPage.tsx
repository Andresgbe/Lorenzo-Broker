import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { AuthShell } from '../../widgets/auth-shell';
import { RegisterForm } from '../../features/register';

export function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Regístrate para elegir tu membresía y entrar a las clases."
      headerAside={
        <p className="text-[13px] text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to={ROUTES.signIn} className="text-accent hover:underline">
            Inicia sesión
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
