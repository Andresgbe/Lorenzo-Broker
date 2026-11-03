/**
 * URL sin firmar del reproductor de Bunny. Solo funciona con Token Authentication apagada en la
 * librería: es el respaldo mientras la Edge Function bunny-video-url no esté disponible. Cada curso
 * tiene su Video Library (courses.bunny_library_id). El ID de la librería no es secreto; las claves
 * de Token Authentication sí, y van solo en los secretos de Supabase.
 */
export function bunnyEmbedUrl(libraryId: string, videoId: string): string {
  return `https://player.mediadelivery.net/embed/${encodeURIComponent(libraryId)}/${encodeURIComponent(videoId)}?autoplay=false&preload=false&responsive=true`;
}
