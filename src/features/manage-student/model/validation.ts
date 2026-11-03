export const REASON_MIN = 5;

export function reasonError(reason: string) {
  return reason.trim().length < REASON_MIN ? 'Escribe el motivo: queda guardado en el historial del alumno.' : undefined;
}

/** "29", "29,50", "29.50" o "6.245,73" a céntimos enteros. null si no se entiende o no es mayor que cero. */
export function parseAmountToCents(value: string): number | null {
  const compact = value.trim().replace(/\s/g, '');
  const normalized = compact.includes(',') ? compact.replace(/\./g, '').replace(',', '.') : compact;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 ? cents : null;
}
