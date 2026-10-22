import { createContext } from 'react';
import type { SessionRole, SessionUser } from './types';

export interface AuthResult {
  error: string | null;
}

/** El rol de la cuenta que acaba de entrar, para decidir a dónde mandarla. */
export interface LoginResult extends AuthResult {
  role: SessionRole | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  taxId: string;
}

export interface AuthContextValue {
  user: SessionUser | null;
  /** Hay una sesión abierta, de alumno o de administrador. */
  isAuthenticated: boolean;
  /** Solo para superficies de administración. No uses isAuthenticated para eso. */
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  /** Cambia la contraseña de la sesión abierta (la de recuperación, al volver del correo). */
  updatePassword: (password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
