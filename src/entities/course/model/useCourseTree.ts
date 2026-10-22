import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCourseTree } from '../api/courseApi';
import type { Course } from './types';

const LOAD_ERROR = 'No se pudo cargar el contenido.';

/** Deja solo cursos, módulos y clases publicados. */
function onlyPublished(courses: Course[]): Course[] {
  return courses
    .filter((course) => course.isPublished)
    .map((course) => ({
      ...course,
      modules: course.modules
        .filter((module) => module.isPublished)
        .map((module) => ({ ...module, lessons: module.lessons.filter((lesson) => lesson.isPublished) })),
    }));
}

/**
 * Árbol de cursos visible para el usuario actual (RLS decide qué incluye).
 * `publishedOnly` lo usan las vistas del alumno: así un admin en Vista de alumno
 * tampoco ve borradores. El panel lo deja en false para editarlos.
 */
export function useCourseTree({ publishedOnly = false }: { publishedOnly?: boolean } = {}) {
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

  const visible = useMemo(() => (publishedOnly ? onlyPublished(courses) : courses), [courses, publishedOnly]);

  return { courses: visible, isLoading, error, reload };
}
