import type { StatusTone } from '../../../shared/ui/StatusPill';

export type StudentStatus = 'Activa' | 'Por vencer' | 'En gracia' | 'Vencida' | 'Sin plan' | 'Acceso quitado';

export interface Student {
  id: string;
  /** null si la cuenta no tiene estos datos todavía (p. ej. no pasó por el registro). */
  name: string | null;
  email: string;
  taxId: string | null;
  planName: string | null;
  /** YYYY-MM-DD, en hora de Caracas. null si nunca tuvo plan. */
  expiresOn: string | null;
  status: StudentStatus;
}

export const STUDENT_STATUS_TONE: Record<StudentStatus, StatusTone> = {
  Activa: 'success',
  'Por vencer': 'warning',
  'En gracia': 'warning',
  Vencida: 'danger',
  'Sin plan': 'neutral',
  'Acceso quitado': 'danger',
};
