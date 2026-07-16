import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import type { VideoSource } from '../model/useVideoSource';
import { cn } from '../../../shared/lib/cn';

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
      ) : (
        <LiteYouTubeEmbed 
          id={source.videoId} 
          title={title} 
        />
      )}
    </div>
  );
}
