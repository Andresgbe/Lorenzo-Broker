import { useCallback, useEffect, useState } from 'react';
import { fetchCourseTree } from '../api/courseApi';
import type { Course } from './types';

const LOAD_ERROR = 'No se pudo cargar el contenido.';

/** Árbol de cursos visible para el usuario actual (RLS decide qué incluye). */
export function useCourseTree() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCourseTree()
      .then((tree) => {
        if (cancelled) return;
        setCourses(tree);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : LOAD_ERROR);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Vuelve a leer el árbol después de una escritura. */
  const reload = useCallback(async () => {
    try {
      setCourses(await fetchCourseTree());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : LOAD_ERROR);
    }
  }, []);

  return { courses, isLoading, error, reload };
}
