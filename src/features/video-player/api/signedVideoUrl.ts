import { supabase } from '../../../shared/lib/supabaseClient';

export type VideoAccessTarget = { lessonId: string } | { courseId: string };

export type SignedVideoResult = { kind: 'url'; url: string } | { kind: 'denied' } | { kind: 'unavailable' };

/**
 * Pide al servidor la URL firmada del video. 'denied': el servidor dijo que no tiene acceso.
 * 'unavailable': la función no respondió o aún no tiene la clave de esa librería.
 */
export async function requestSignedVideoUrl(target: VideoAccessTarget): Promise<SignedVideoResult> {
  if (!supabase) return { kind: 'unavailable' };
  const { data, error } = await supabase.functions.invoke<{ url: string }>('bunny-video-url', { body: target });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    return status === 403 ? { kind: 'denied' } : { kind: 'unavailable' };
  }
  return data?.url ? { kind: 'url', url: data.url } : { kind: 'unavailable' };
}
