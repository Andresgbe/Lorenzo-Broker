import type { Student } from '../../../entities/student';

/** Solo el dueño puede editar o quitarle el acceso a su propia cuenta. La BD lo exige igual. */
export function canManageStudent(student: Student, currentUserId: string | undefined) {
  return student.role !== 'owner' || student.id === currentUserId;
}

/** Tiene un acceso que quitar. */
export function canRevokeStudent(student: Student, currentUserId: string | undefined) {
  return canManageStudent(student, currentUserId) && student.status !== 'Sin plan' && student.status !== 'Acceso quitado';
}
