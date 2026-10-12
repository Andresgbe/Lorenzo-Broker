import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { AuthShell } from '../../widgets/auth-shell';
import { SignInForm } from '../../features/sign-in';

export function SignInPage() {
  return (
    <AuthShell
      title="Bienvenido de vuelta"
      subtitle="Entra con tu correo para ver tus clases."
      headerAside={
        <p className="text-[13px] text-muted">
          ¿No tienes cuenta?{' '}
          <Link to={ROUTES.register} className="text-accent hover:underline">
            Regístrate
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
