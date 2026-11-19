import type { VideoAccessTarget } from '../api/signedVideoUrl';

export type VideoSource =
  | { type: "local"; src: string; poster?: string }
  /** Video público (portada): sin comprobar acceso, así que la librería debe tener Token Authentication apagada. */
  | { type: "bunny-public"; libraryId: string; videoId: string }
  | { type: "bunny"; libraryId: string; videoId: string; access: VideoAccessTarget }
  | { type: "placeholder" };

export function useVideoSource(source: VideoSource): VideoSource {
  // Passthrough for now
  return source;
}
