import { useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../../../entities/session';
import { EditModeContext } from './edit-mode-context';

/**
 * Modo edición de la web pública. Empieza apagado: aunque sea admin, nada es editable hasta que
 * pulse "Editar". Si pasa a vista de alumno o cierra sesión, isAdmin se apaga y con él la edición.
 */
export function EditModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);

  const value = useMemo(
    () => ({ canEdit: isAdmin, isEditing: isAdmin && editing, setEditing }),
    [isAdmin, editing]
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}
