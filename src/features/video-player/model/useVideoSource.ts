import type { VideoAccessTarget } from '../api/signedVideoUrl';

export type VideoSource =
  | { type: "local"; src: string; poster?: string }
  | { type: "youtube"; videoId: string }
  | { type: "bunny"; libraryId: string; videoId: string; access: VideoAccessTarget }
  | { type: "placeholder" };

export function useVideoSource(source: VideoSource): VideoSource {
  // Passthrough for now
  return source;
}
