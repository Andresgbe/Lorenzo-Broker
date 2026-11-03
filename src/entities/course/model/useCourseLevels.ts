import { useCallback, useEffect, useState } from 'react';
import { fetchCourseLevels } from '../api/courseApi';
import type { CourseLevel } from './types';

/** Los niveles en orden. Sin ellos (migración 0012 sin aplicar) los cursos se muestran sin agrupar. */
export function useCourseLevels() {
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLevels(await fetchCourseLevels());
    } catch {
      setLevels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    fetchCourseLevels()
      .then((rows) => {
        if (isCurrent) setLevels(rows);
      })
      .catch(() => {
        if (isCurrent) setLevels([]);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  return { levels, isLoading, reload };
}
