import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { useAuth } from '../model/useAuth';

interface RequireAdminProps {
  children: ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.adminLogin} replace />;
  }

  return <>{children}</>;
}
