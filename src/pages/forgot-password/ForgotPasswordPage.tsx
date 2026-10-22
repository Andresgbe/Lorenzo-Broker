import { Link, useLocation } from 'react-router-dom';
import { ROUTES, safeInternalPath, type BackLinkState } from '../../shared/config/routes';
import { PageTopBar } from '../../shared/ui/PageTopBar';
import { AuthShell } from '../../widgets/auth-shell';
import { PasswordResetForm } from '../../features/password-reset';

export function ForgotPasswordPage() {
  // Si se llegó desde otra parte de la app (Mi cuenta › Seguridad), arriba va el volver
  // de siempre hacia ahí; si no, el enlace al inicio de sesión, que es el camino normal.
  const state = useLocation().state as Partial<BackLinkState> | null;
  const backTo = safeInternalPath(state?.from);
  const fromTitle = state?.fromTitle || 'Atrás';

  return (
    <AuthShell
      title="Recupera tu contraseña"
      subtitle="Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva."
      topBar={
        backTo && (
          <PageTopBar
            backTo={backTo}
            backLabel={`Volver a ${fromTitle}`}
            crumbs={[{ label: fromTitle, to: backTo }, { label: 'Recuperar contraseña' }]}
          />
        )
      }
      footer={
        !backTo && (
          <Link to={ROUTES.signIn} className="text-accent hover:underline">
            Volver a iniciar sesión
          </Link>
        )
      }
    >
      <PasswordResetForm />
    </AuthShell>
  );
}
