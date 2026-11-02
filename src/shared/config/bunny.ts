/**
 * Bunny Stream: la Video Library donde viven los videos de los cursos.
 * El ID de la librería no es secreto (va en la URL del reproductor). La API Key y la
 * Token Authentication Key sí lo son: van solo en los secretos de Supabase, nunca aquí.
 */
export const BUNNY_LIBRARY_ID = '792090';

/**
 * URL del reproductor de Bunny para un video. Embed público mientras Token Authentication
 * esté apagada en la librería; cuando se active, la URL firmada (token + expires) la
 * emitirá la Edge Function tras comprobar el acceso del alumno.
 */
export function bunnyEmbedUrl(videoId: string): string {
  return `https://player.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${encodeURIComponent(videoId)}?autoplay=false&preload=false&responsive=true`;
}
