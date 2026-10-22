import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabaseClient';
import { ROUTES } from '../../../shared/config/routes';
import { AuthContext, type AuthContextValue, type RegisterInput } from './auth-context';
import type { SessionUser } from './types';

export const NOT_CONFIGURED = 'Supabase no está configurado en este entorno.';

// El rol se lee de app_metadata, que solo se puede escribir desde el servidor.
// user_metadata lo puede editar el propio usuario, así que no sirve para permisos.
function toSessionUser(user: User | null | undefined): SessionUser | null {
  if (!user?.email) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.app_metadata?.role === 'admin' ? 'admin' : 'student',
    fullName: user.user_metadata?.full_name ?? null,
    taxId: user.user_metadata?.tax_id ?? null,
  };
}

function absoluteUrl(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${base}${path}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => supabase !== null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(toSessionUser(data.session?.user));
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toSessionUser(session?.user));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: NOT_CONFIGURED, role: null };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, role: null };
    return { error: null, role: toSessionUser(data.user)?.role ?? null };
  }, []);

  const register = useCallback(async ({ email, password, fullName, taxId }: RegisterInput) => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, tax_id: taxId },
        emailRedirectTo: absoluteUrl(ROUTES.signIn),
      },
    });
    return { error: error ? error.message : null };
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: absoluteUrl(ROUTES.resetPassword),
    });
    return { error: error ? error.message : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) return { error: NOT_CONFIGURED };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? error.message : null };
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      register,
      requestPasswordReset,
      updatePassword,
      logout,
    }),
    [user, isLoading, login, register, requestPasswordReset, updatePassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
