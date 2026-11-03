import type { StatusTone } from '../../../shared/ui/StatusPill';

export type StudentStatus = 'Activa' | 'Por vencer' | 'En gracia' | 'Vencida' | 'Sin plan' | 'Acceso quitado';

/** Copia de app_metadata en profiles (migración 0007). Para mostrar: los permisos los decide la BD. */
export type StudentRole = 'student' | 'admin' | 'owner';

export const ROLE_LABEL: Record<StudentRole, string | null> = {
  student: null,
  admin: 'Admin',
  owner: 'Dueño',
};

export interface Student {
  id: string;
  /** null si la cuenta no tiene estos datos todavía (p. ej. no pasó por el registro). */
  name: string | null;
  email: string;
  taxId: string | null;
  phone: string | null;
  role: StudentRole;
  planId: string | null;
  planName: string | null;
  /** YYYY-MM-DD, en hora de Caracas. null si nunca tuvo plan. */
  expiresOn: string | null;
  status: StudentStatus;
}

/** Una acción manual de un admin sobre esta cuenta (admin_actions). */
export interface StudentAction {
  id: string;
  action: string;
  reason: string;
  details: Record<string, unknown>;
  /** ISO en UTC. */
  at: string;
  adminName: string | null;
}

export const STUDENT_STATUS_TONE: Record<StudentStatus, StatusTone> = {
  Activa: 'success',
  'Por vencer': 'warning',
  'En gracia': 'warning',
  Vencida: 'danger',
  'Sin plan': 'neutral',
  'Acceso quitado': 'danger',
};
