import { useCallback, useEffect, useState } from 'react';
import { fetchStudentActions, fetchStudents } from '../api/studentApi';
import type { Student, StudentAction } from './students';

/** Las cuentas registradas, para el panel de admin. */
export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    fetchStudents()
      .then((rows) => {
        if (isCurrent) {
          setStudents(rows);
          setError(null);
        }
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
  }, [version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { students, isLoading, error, reload };
}

interface LoadedStudent {
  id: string;
  student: Student | null;
  actions: StudentAction[];
  failed: boolean;
}

/** Una cuenta con el historial de acciones, para su página de detalle. */
export function useStudent(id: string | undefined) {
  const [loaded, setLoaded] = useState<LoadedStudent | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!id) return;
    let isCurrent = true;
    Promise.all([fetchStudents(id), fetchStudentActions(id)])
      .then(([students, actions]) => {
        if (isCurrent) setLoaded({ id, student: students[0] ?? null, actions, failed: false });
      })
      .catch(() => {
        if (isCurrent) setLoaded({ id, student: null, actions: [], failed: true });
      });
    return () => {
      isCurrent = false;
    };
  }, [id, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const current = id && loaded?.id === id ? loaded : null;
  return {
    student: current?.student ?? null,
    actions: current?.actions ?? [],
    failed: current?.failed ?? false,
    isLoading: Boolean(id) && current === null,
    reload,
  };
}
