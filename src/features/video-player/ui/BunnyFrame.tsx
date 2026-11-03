import { useEffect, useState } from 'react';
import { bunnyEmbedUrl } from '../../../shared/config/bunny';
import { requestSignedVideoUrl, type SignedVideoResult, type VideoAccessTarget } from '../api/signedVideoUrl';

interface BunnyFrameProps {
  libraryId: string;
  videoId: string;
  access: VideoAccessTarget;
  title: string;
}

/**
 * Reproductor de Bunny con la URL firmada del servidor. Si la función aún no está disponible usa
 * la URL sin firmar: mientras Token Authentication esté apagada se ve, y al encenderla deja de verse.
 */
export function BunnyFrame({ libraryId, videoId, access, title }: BunnyFrameProps) {
  const [result, setResult] = useState<{ key: string; value: SignedVideoResult } | null>(null);
  const key = JSON.stringify(access);

  useEffect(() => {
    let isCurrent = true;
    void requestSignedVideoUrl(JSON.parse(key) as VideoAccessTarget).then((value) => {
      if (isCurrent) setResult({ key, value });
    });
    return () => {
      isCurrent = false;
    };
  }, [key]);

  const current = result?.key === key ? result.value : null;

  if (!current) return <div className="absolute inset-0 bg-black" />;

  if (current.kind === 'denied') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black p-6 text-center text-[14px] text-muted">
        No tienes acceso a este video. Revisa tu membresía en Mi cuenta.
      </div>
    );
  }

  return (
    <iframe
      src={current.kind === 'url' ? current.url : bunnyEmbedUrl(libraryId, videoId)}
      title={title}
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className="absolute inset-0 h-full w-full border-0 bg-black"
    />
  );
}
