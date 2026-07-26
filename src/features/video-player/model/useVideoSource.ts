export type VideoSource =
  | { type: "local"; src: string; poster?: string }
  | { type: "youtube"; videoId: string }
  | { type: "placeholder" };

export function useVideoSource(source: VideoSource): VideoSource {
  // Passthrough for now
  return source;
}
