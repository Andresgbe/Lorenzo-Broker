import type { ReactNode } from 'react';
import { formatDuration, type Lesson } from '../../entities/course';
import { VideoPlayer } from '../../features/video-player';
import { cn } from '../../shared/lib/cn';
import { StatusPill } from '../../shared/ui/StatusPill';

interface LessonVideoPreviewProps {
  lesson: Lesson;
  isModulePublished: boolean;
  courseLibraryId: string | null;
  /** El formulario tiene un video o una librería sin guardar. */
  hasUnsavedVideo: boolean;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-t border-line first:border-t-0 text-[13px]">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="text-ink-soft text-right min-w-0 break-all">{children}</dd>
    </div>
  );
}

/**
 * Previsualización del administrador, distinta a la del alumno: el video guardado junto a sus
 * datos técnicos y lo que falta para que se reproduzca. Se edita en el formulario de al lado.
 */
export function LessonVideoPreview({ lesson, isModulePublished, courseLibraryId, hasUnsavedVideo }: LessonVideoPreviewProps) {
  const libraryId = lesson.bunnyLibraryId ?? courseLibraryId;
  const canPlay = Boolean(lesson.bunnyVideoId && libraryId);
  const isVisible = isModulePublished && lesson.isPublished;

  return (
    <section className="bg-panel border border-line rounded-[18px] overflow-hidden xl:sticky xl:top-[100px]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
        <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">Previsualización</h2>
        <StatusPill tone={isVisible ? 'success' : 'warning'}>{isVisible ? 'Visible para alumnos' : 'Oculta para alumnos'}</StatusPill>
      </div>

      {lesson.bunnyVideoId && libraryId ? (
        <VideoPlayer
          key={`${libraryId}-${lesson.bunnyVideoId}`}
          source={{ type: 'bunny', libraryId, videoId: lesson.bunnyVideoId, access: { lessonId: lesson.id } }}
          title={lesson.title}
          className="w-full rounded-none"
        />
      ) : (
        <div className="aspect-video flex items-center justify-center bg-bg-2 px-6 text-center text-[13.5px] text-muted">
          {lesson.bunnyVideoId
            ? 'Falta la librería de Bunny: ponla en el formulario o en los datos del curso.'
            : 'Esta clase no tiene video. Pega su ID en el formulario y guarda.'}
        </div>
      )}

      {hasUnsavedVideo && (
        <p className="px-5 py-3 border-b border-gold/30 bg-gold/10 text-[13px] text-ink-soft">
          Cambiaste el video o la librería. Guarda para verlo aquí.
        </p>
      )}

      <dl className="px-5 py-2">
        <Row label="Video ID">
          <span className={cn(lesson.bunnyVideoId ? 'font-mono text-[12.5px]' : 'text-gold')}>{lesson.bunnyVideoId ?? 'Sin video'}</span>
        </Row>
        <Row label="Librería">
          {libraryId ? (
            <>
              <span className="font-mono text-[12.5px]">{libraryId}</span>
              <span className="text-muted"> · {lesson.bunnyLibraryId ? 'de esta clase' : 'del curso'}</span>
            </>
          ) : (
            <span className="text-gold">Sin configurar</span>
          )}
        </Row>
        <Row label="Duración">{formatDuration(lesson.durationSeconds) ?? '—'}</Row>
        <Row label="Material en PDF">{lesson.attachments.length}</Row>
        <Row label="Reproducción">
          <span className={canPlay ? 'text-accent' : 'text-gold'}>{canPlay ? 'Lista' : 'Falta configurar'}</span>
        </Row>
      </dl>
    </section>
  );
}
