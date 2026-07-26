import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import type { VideoSource } from '../model/useVideoSource';
import { cn } from '../../../shared/lib/cn';
import { MediaPlaceholder } from '../../../shared/ui/MediaPlaceholder';

interface VideoPlayerProps {
  source: VideoSource;
  title: string;
  className?: string;
}

export function VideoPlayer({ source, title, className }: VideoPlayerProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl aspect-video relative', className)}>
      {source.type === 'local' ? (
        <video
          src={source.src}
          poster={source.poster}
          preload="none"
          title={title}
          controls
          className="h-full w-full object-cover bg-black"
        />
      ) : source.type === 'youtube' ? (
        <LiteYouTubeEmbed
          id={source.videoId}
          title={title}
        />
      ) : (
        <MediaPlaceholder
          icon={
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-ink-inverse translate-x-[1px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          }
          label="Video próximamente"
          className="h-full w-full"
        />
      )}
    </div>
  );
}
