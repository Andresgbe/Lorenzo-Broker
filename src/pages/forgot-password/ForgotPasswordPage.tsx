import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { AuthShell } from '../../widgets/auth-shell';
import { PasswordResetForm } from '../../features/password-reset';

export function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recupera tu contraseña"
      subtitle="Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva."
      footer={
        <Link to={ROUTES.signIn} className="text-accent hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <PasswordResetForm />
    </AuthShell>
  );
}
