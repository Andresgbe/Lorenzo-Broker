import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../model/useAuth';
import type { SignInRedirectState } from './RequireAuth';

interface RequireAdminProps {
  children: ReactNode;
}

/**
 * Exige role=admin. Sin sesión manda al login único y vuelve a la página pedida;
 * con sesión de alumno manda a su área. Los datos los protege RLS en Supabase.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { pathname, search } = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    const state: SignInRedirectState = { from: pathname + search };
    return <Navigate to={ROUTES.signIn} replace state={state} />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.student} replace />;
  }

  return <>{children}</>;
}
