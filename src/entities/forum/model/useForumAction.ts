import { useCallback, useState } from 'react';

/** Escritura en el foro con estado de "guardando" y error en español, para alumnos y admins. */
export function useForumAction() {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setIsBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('Este hilo está cerrado')) setError('Este hilo está cerrado.');
      else if (/row-level security|permission denied|42501/i.test(message)) {
        setError('No tienes acceso a este foro. Puede que tu membresía haya vencido.');
      } else setError('No se pudo guardar. Intenta de nuevo en un momento.');
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { run, isBusy, error };
}
