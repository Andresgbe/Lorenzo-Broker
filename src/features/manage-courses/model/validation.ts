/** El Video library ID es solo números. Vacío es válido: el curso aún no tiene librería. */
export function bunnyLibraryError(value: string) {
  return /^\d*$/.test(value.trim()) ? undefined : 'Escribe solo el número del Video library ID, por ejemplo 123456.';
}
