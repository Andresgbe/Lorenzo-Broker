import { useCallback, useState } from 'react';

/**
 * Ejecuta una escritura del admin con estado de "guardando" y error en español.
 * `run` devuelve true si salió bien, para encadenar recargas o navegación.
 */
export function useAdminAction() {
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
      setError(
        /row-level security|permission denied|42501/i.test(message)
          ? 'No tienes permiso para hacer este cambio. Cierra sesión y vuelve a entrar con una cuenta de administrador.'
          : `No se pudo guardar. ${message}`.trim()
      );
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { run, isBusy, error, clearError: () => setError(null) };
}
