import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../model/useAuth';

interface RequireAuthProps {
  children: ReactNode;
}

/** Lo que viaja en el state de /iniciar-sesion cuando un guard manda ahí. */
export interface SignInRedirectState {
  /** Ruta interna a la que volver tras iniciar sesión, con su ?query. */
  from: string;
}

/**
 * Exige una sesión iniciada (cualquier rol). Sin sesión manda a iniciar sesión
 * y, al entrar, el formulario devuelve a la página pedida. Es solo la puerta de
 * la interfaz: los datos los protege RLS en Supabase.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname, search } = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    const state: SignInRedirectState = { from: pathname + search };
    return <Navigate to={ROUTES.signIn} replace state={state} />;
  }

  return <>{children}</>;
}
