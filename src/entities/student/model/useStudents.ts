import { useEffect, useState } from 'react';
import { fetchStudents } from '../api/studentApi';
import type { Student } from './students';

/** Las cuentas registradas, para el panel de admin. */
export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    fetchStudents()
      .then((rows) => {
        if (isCurrent) setStudents(rows);
      })
      .catch(() => {
        if (isCurrent) setError('No pudimos cargar los alumnos. Intenta de nuevo en un momento.');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  return { students, isLoading, error };
}
