import { useState, type FormEvent } from 'react';
import { parseBunnyUrl } from '../../shared/config/bunny';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/TextField';
import { FormAlert } from '../../shared/ui/FormAlert';

export interface HeroVideo {
  libraryId: string;
  videoId: string;
}

interface HeroVideoEditorProps {
  video: HeroVideo | null;
  onSave: (next: HeroVideo | null) => Promise<void>;
}

/** Solo para administradores: cambia el video de bienvenida pegando un enlace de Bunny Stream. */
export function HeroVideoEditor({ video, onSave }: HeroVideoEditorProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseBunnyUrl(url);
    if (!parsed) {
      setError('Pega el enlace del video en Bunny Stream (el de Embed o Play).');
      return;
    }
    setError(undefined);
    await onSave(parsed);
    setUrl('');
    setSaved(true);
  }

  async function handleReset() {
    await onSave(null);
    setSaved(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 pt-5 border-t border-line text-left flex flex-col gap-3">
      <TextField
        label="Video de bienvenida (enlace de Bunny Stream)"
        value={url}
        placeholder="https://iframe.mediadelivery.net/embed/123456/xxxxxxxx-xxxx-…"
        hint={
          video
            ? `Ahora se ve el video ${video.videoId} de la librería ${video.libraryId}. Es un video público: la librería debe tener Token Authentication apagada.`
            : 'Ahora se ve el video de YouTube por defecto. Pega un enlace de Bunny para reemplazarlo.'
        }
        error={error}
        onChange={(event) => {
          setUrl(event.target.value);
          setError(undefined);
          setSaved(false);
        }}
      />
      {saved && <FormAlert variant="success">Video guardado.</FormAlert>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm">
          Guardar video
        </Button>
        {video && (
          <Button type="button" size="sm" variant="ghost" onClick={handleReset}>
            Volver al video de YouTube
          </Button>
        )}
      </div>
    </form>
  );
}
