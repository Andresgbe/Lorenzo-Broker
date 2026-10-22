import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  formatDuration,
  formatFileSize,
  getAttachmentUrl,
  locateLesson,
  useCourseTree,
  useLessonProgress,
  type LessonAttachment,
} from '../../entities/course';
import { ROUTES, studentCoursePath, studentLessonPath } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { FormAlert } from '../../shared/ui/FormAlert';
import { MediaPlaceholder } from '../../shared/ui/MediaPlaceholder';
import { PageTopBar } from '../../shared/ui/PageTopBar';
import { cn } from '../../shared/lib/cn';

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function DownloadButton({ attachment }: { attachment: LessonAttachment }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  async function handleClick() {
    setState('loading');
    try {
      // URL firmada de 5 minutos: solo se emite si el servidor confirma el acceso.
      window.location.assign(await getAttachmentUrl(attachment));
      setState('idle');
    } catch {
      setState('error');
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={state === 'loading'}
      className="flex items-center justify-between gap-4 w-full bg-panel border border-line rounded-xl px-4 py-3 text-left hover:border-accent/40 transition-colors cursor-pointer"
    >
      <span className="min-w-0">
        <span className="block text-[14px] text-ink truncate">{attachment.title}.pdf</span>
        {state === 'error' && <span className="block text-[11.5px] text-red-400 mt-0.5">No se pudo descargar. Intenta de nuevo.</span>}
      </span>
      <span className="flex items-center gap-1.5 text-[13px] text-accent shrink-0">
        <DownloadIcon className="w-4 h-4" />
        {state === 'loading' ? 'Preparando…' : formatFileSize(attachment.sizeBytes) || 'Descargar'}
      </span>
    </button>
  );
}

export function StudentLessonPage() {
  const { lessonId } = useParams();
  const { courses, isLoading, error } = useCourseTree();
  const { completed, toggle } = useLessonProgress();

  if (isLoading) {
    return (
      <Container className="py-10 md:py-14">
        <p className="text-muted text-[14px]">Cargando clase…</p>
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="py-10 md:py-14">
        <FormAlert variant="error">No pudimos cargar la clase. Intenta de nuevo en un momento.</FormAlert>
      </Container>
    );
  }

  const location = locateLesson(courses, lessonId);
  if (!location) return <Navigate to={ROUTES.studentCourses} replace />;
  const { course, module, lesson, previous, next } = location;
  const isDone = completed.has(lesson.id);

  return (
    <Container className="py-10 md:py-14">
      <PageTopBar
        backTo={studentCoursePath(course.id)}
        backLabel={`Volver a ${course.title}`}
        crumbs={[
          { label: 'Tus cursos', to: ROUTES.studentCourses },
          { label: course.title, to: studentCoursePath(course.id) },
          { label: module.title, to: studentCoursePath(course.id) },
          { label: lesson.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
        <div>
          {/* El reproductor de Bunny necesita una URL firmada que emite el servidor tras validar
              el acceso (Edge Function, pendiente). Hasta entonces se muestra el marcador. */}
          <MediaPlaceholder
            icon={<PlayIcon className="w-6 h-6 fill-ink-inverse translate-x-[1px]" />}
            label={lesson.bunnyVideoId ? 'Video en preparación' : 'Esta clase no tiene video'}
            className="aspect-video w-full rounded-[18px]"
          />

          <div className="flex flex-wrap items-start justify-between gap-4 mt-7">
            <h1 className="font-display font-bold text-[clamp(21px,2.8vw,27px)] text-ink text-balance">{lesson.title}</h1>
            <button
              type="button"
              onClick={() => void toggle(lesson.id)}
              aria-pressed={isDone}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer',
                isDone ? 'bg-accent/10 border-accent/30 text-accent' : 'border-line text-ink hover:border-accent hover:text-accent'
              )}
            >
              <CheckIcon className="w-4 h-4" />
              {isDone ? 'Completada' : 'Marcar como completada'}
            </button>
          </div>

          {lesson.description && (
            <p className="text-muted text-[15px] leading-relaxed mt-3 whitespace-pre-line text-pretty">{lesson.description}</p>
          )}

          {lesson.attachments.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-3">Material de la clase</h2>
              <ul className="flex flex-col gap-2.5">
                {lesson.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <DownloadButton attachment={attachment} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex items-center justify-between gap-4 mt-9 pt-6 border-t border-line">
            {previous ? (
              <Link to={studentLessonPath(previous.id)} className="text-[13.5px] text-muted hover:text-accent transition-colors">
                ← Clase anterior
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Button to={studentLessonPath(next.id)} variant="primary">
                Siguiente clase
              </Button>
            ) : (
              <Link to={studentCoursePath(course.id)} className="text-[13.5px] text-accent hover:underline">
                Volver al curso
              </Link>
            )}
          </div>
        </div>

        <aside className="bg-panel border border-line rounded-[18px] overflow-hidden">
          <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent px-5 py-4 border-b border-line">
            {module.title}
          </h2>
          <ul>
            {module.lessons.map((item) => {
              const isCurrent = item.id === lesson.id;
              const itemDone = completed.has(item.id);
              return (
                <li key={item.id} className="border-b border-line last:border-b-0">
                  <Link
                    to={studentLessonPath(item.id)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3 text-[13.5px] transition-colors',
                      isCurrent ? 'text-accent bg-accent/10' : 'text-ink-soft hover:text-accent hover:bg-bg-2/60'
                    )}
                  >
                    <CheckIcon className={cn('w-3.5 h-3.5 shrink-0', itemDone ? 'text-accent' : 'text-transparent')} />
                    <span className="flex-1 min-w-0">{item.title}</span>
                    <span className="text-[12px] text-muted shrink-0">{formatDuration(item.durationSeconds) ?? ''}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </Container>
  );
}
