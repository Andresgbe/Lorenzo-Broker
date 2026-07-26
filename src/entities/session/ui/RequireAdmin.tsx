import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../model/useAuth';

interface RequireAdminProps {
  children: ReactNode;
}

// Wrap future admin-only routes/sections with this to redirect anonymous
// visitors to /login. Ready to use once specific editable sections are defined.
export function RequireAdmin({ children }: RequireAdminProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <>{children}</>;
}
