import { AuthShell } from '../../widgets/auth-shell';
import { NewPasswordForm } from '../../features/password-reset';

export function ResetPasswordPage() {
  return (
    <AuthShell
      title="Crea una contraseña nueva"
      subtitle="Escribe la contraseña con la que vas a entrar de ahora en adelante."
    >
      <NewPasswordForm />
    </AuthShell>
  );
}
