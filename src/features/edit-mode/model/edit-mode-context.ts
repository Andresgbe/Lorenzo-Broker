import { createContext, useContext } from 'react';

export interface EditModeValue {
  /** Solo un admin puede editar (gatea en isAdmin, nunca en isAuthenticated). */
  canEdit: boolean;
  /** El admin pulsó "Editar": los textos de la web se vuelven editables. */
  isEditing: boolean;
  setEditing: (value: boolean) => void;
}

export const EditModeContext = createContext<EditModeValue>({
  canEdit: false,
  isEditing: false,
  setEditing: () => {},
});

export function useEditMode(): EditModeValue {
  return useContext(EditModeContext);
}
