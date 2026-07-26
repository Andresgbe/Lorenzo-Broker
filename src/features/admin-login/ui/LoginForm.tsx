import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../entities/session';
import { ROUTES } from '../../../shared/config/routes';
import { Button } from '../../../shared/ui/Button';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const { error } = await login(email.trim(), password);
    setIsSubmitting(false);

    if (error) {
      setError(error === 'Supabase no está configurado en este entorno.' ? error : 'Email o contraseña incorrectos.');
    } else {
      setError(null);
      navigate(ROUTES.home);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
      <div className="flex flex-col gap-2 text-left">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-[1.4px] text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="bg-panel border border-line rounded-xl px-4 py-3 text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
          placeholder="admin@lorenzobroker.com"
          required
        />
      </div>

      <div className="flex flex-col gap-2 text-left">
        <label htmlFor="password" className="text-xs font-bold uppercase tracking-[1.4px] text-muted">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="bg-panel border border-line rounded-xl px-4 py-3 text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
