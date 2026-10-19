import { useCallback, useEffect, useState } from 'react';
import { fetchCompletedLessonIds, setLessonCompleted } from '../api/courseApi';

/** Clases que el alumno marcó como completadas, con un toggle que guarda en Supabase. */
export function useLessonProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCompletedLessonIds()
      .then(setCompleted)
      .catch(() => setCompleted(new Set()));
  }, []);

  const toggle = useCallback(async (lessonId: string) => {
    const isDone = completed.has(lessonId);
    const next = new Set(completed);
    if (isDone) next.delete(lessonId);
    else next.add(lessonId);
    setCompleted(next);
    try {
      await setLessonCompleted(lessonId, !isDone);
    } catch {
      setCompleted(completed);
    }
  }, [completed]);

  return { completed, toggle };
}
