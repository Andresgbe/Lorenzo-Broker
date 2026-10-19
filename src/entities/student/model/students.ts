import type { StatusTone } from '../../../shared/ui/StatusPill';

export type StudentStatus = 'Activa' | 'Por vencer' | 'Vencida';

export interface Student {
  id: string;
  name: string;
  email: string;
  taxId: string;
  planName: string;
  /** YYYY-MM-DD */
  expiresOn: string;
  status: StudentStatus;
}

export const STUDENT_STATUS_TONE: Record<StudentStatus, StatusTone> = {
  Activa: 'success',
  'Por vencer': 'warning',
  Vencida: 'danger',
};

/** Datos de ejemplo. Reemplazar por la tabla de alumnos de Supabase. */
export const DEMO_STUDENTS: Student[] = [
  { id: 'al-01', name: 'María Pérez', email: 'maria@ejemplo.com', taxId: 'V-12345678', planName: 'Mensual', expiresOn: '2026-11-08', status: 'Activa' },
  { id: 'al-02', name: 'José Rodríguez', email: 'jose@ejemplo.com', taxId: 'V-20811223', planName: 'Mensual', expiresOn: '2026-10-18', status: 'Por vencer' },
  { id: 'al-03', name: 'Andrea Molina', email: 'andrea@ejemplo.com', taxId: 'V-18992341', planName: 'Mensual', expiresOn: '2026-11-10', status: 'Activa' },
  { id: 'al-04', name: 'Carlos Lugo', email: 'carlos@ejemplo.com', taxId: 'V-15340982', planName: 'Mensual', expiresOn: '2026-11-09', status: 'Activa' },
  { id: 'al-05', name: 'Daniela Ruiz', email: 'daniela@ejemplo.com', taxId: 'V-22104567', planName: 'Mensual', expiresOn: '2026-10-16', status: 'Por vencer' },
  { id: 'al-06', name: 'Luis Hernández', email: 'luis@ejemplo.com', taxId: 'V-17883420', planName: 'Mensual', expiresOn: '2026-09-28', status: 'Vencida' },
  { id: 'al-07', name: 'Patricia Gómez', email: 'patricia@ejemplo.com', taxId: 'V-13550871', planName: 'Mensual', expiresOn: '2026-11-06', status: 'Activa' },
  { id: 'al-08', name: 'Rafael Mendoza', email: 'rafael@ejemplo.com', taxId: 'V-19220045', planName: 'Mensual', expiresOn: '2026-11-05', status: 'Activa' },
];
