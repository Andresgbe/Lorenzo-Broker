/**
 * URL sin firmar del reproductor de Bunny. Solo funciona con Token Authentication apagada en la
 * librería: es el respaldo mientras la Edge Function bunny-video-url no esté disponible. Cada curso
 * tiene su Video Library (courses.bunny_library_id). El ID de la librería no es secreto; las claves
 * de Token Authentication sí, y van solo en los secretos de Supabase.
 */
export function bunnyEmbedUrl(libraryId: string, videoId: string): string {
  return `https://player.mediadelivery.net/embed/${encodeURIComponent(libraryId)}/${encodeURIComponent(videoId)}?autoplay=false&preload=false&responsive=true`;
}

/**
 * Saca la librería y el video de un enlace de Bunny Stream, p. ej.
 * https://iframe.mediadelivery.net/embed/123456/xxxxxxxx-xxxx-… (también player.mediadelivery.net,
 * /play/ y con parámetros). null si no es un enlace de Bunny.
 */
export function parseBunnyLink(link: string): { libraryId: string; videoId: string } | null {
  const match = link
    .trim()
    .match(/^https:\/\/(?:iframe|player)\.mediadelivery\.net\/(?:embed|play)\/(\d+)\/([0-9a-fA-F-]{8,})(?:[/?#].*)?$/);
  return match ? { libraryId: match[1], videoId: match[2] } : null;
}
