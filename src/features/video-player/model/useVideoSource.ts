import type { VideoAccessTarget } from '../api/signedVideoUrl';

export type VideoSource =
  | { type: "local"; src: string; poster?: string }
  | { type: "youtube"; videoId: string }
  | { type: "bunny"; libraryId: string; videoId: string; access: VideoAccessTarget }
  /** Video público (sin chequeo de acceso): usa la URL sin firmar, así que la librería debe tener Token Authentication apagada. */
  | { type: "bunny-public"; libraryId: string; videoId: string }
  | { type: "placeholder" };

export function useVideoSource(source: VideoSource): VideoSource {
  // Passthrough for now
  return source;
}
