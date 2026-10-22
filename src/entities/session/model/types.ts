export type SessionRole = 'admin' | 'student';

export interface SessionUser {
  id: string;
  email: string;
  /** Solo para permisos. Viene de app_metadata, que el usuario no puede escribir. */
  role: SessionRole;
  /** Datos del registro. Vienen de user_metadata: sirven para mostrar, nunca para decidir permisos. */
  fullName: string | null;
  taxId: string | null;
  /** WhatsApp del alumno, editable en Mi cuenta. */
  phone: string | null;
}
