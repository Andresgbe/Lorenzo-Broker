import { Link, Navigate, useParams } from 'react-router-dom';
import { findLesson, findModule, lessonNeighbours } from '../../entities/course';
import { ROUTES, studentLessonPath } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { MediaPlaceholder } from '../../shared/ui/MediaPlaceholder';
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
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function StudentLessonPage() {
  const { lessonId } = useParams();
  const lesson = findLesson(lessonId);

  if (!lesson) {
    return <Navigate to={ROUTES.studentModules} replace />;
  }

  const module = findModule(lesson.moduleId);
  const { previous, next } = lessonNeighbours(lesson);
  const attachments = module?.lessons.filter((item) => item.kind === 'pdf') ?? [];

  return (
    <Container className="py-10 md:py-14">
      <nav className="flex items-center gap-2 text-[12.5px] text-muted mb-6">
        <Link to={ROUTES.studentModules} className="hover:text-accent transition-colors">
          Módulos
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#c6cedb]">{module?.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
        <div>
          <MediaPlaceholder
            icon={<PlayIcon className="w-6 h-6 fill-ink-inverse translate-x-[1px]" />}
            label="Clase próximamente"
            className="aspect-video w-full rounded-[18px]"
          />

          <h1 className="font-display font-bold text-[clamp(21px,2.8vw,27px)] text-ink mt-7 text-balance">
            {lesson.title}
          </h1>
          <p className="text-muted text-[15px] leading-relaxed mt-3 text-pretty">
            [Descripción de la clase — Lorenzo la escribe desde el panel de administración.]
          </p>

          {attachments.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-3">
                Material de la clase
              </h2>
              <ul className="flex flex-col gap-2.5">
                {attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-4 bg-panel border border-line rounded-xl px-4 py-3"
                  >
                    <span className="text-[14px] text-ink truncate">{file.title}.pdf</span>
                    <span className="flex items-center gap-1.5 text-[13px] text-muted shrink-0">
                      <DownloadIcon className="w-4 h-4" />
                      Próximamente
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex items-center justify-between gap-4 mt-9 pt-6 border-t border-line">
            {previous ? (
              <Link
                to={studentLessonPath(previous.id)}
                className="text-[13.5px] text-muted hover:text-accent transition-colors"
              >
                ← Clase anterior
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to={studentLessonPath(next.id)}
                className="text-[13.5px] text-accent hover:underline"
              >
                Siguiente clase →
              </Link>
            )}
          </div>
        </div>

        <aside className="bg-panel border border-line rounded-[18px] overflow-hidden">
          <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent px-5 py-4 border-b border-line">
            {module?.title}
          </h2>
          <ul>
            {module?.lessons.map((item) => {
              const isCurrent = item.id === lesson.id;
              return (
                <li key={item.id} className="border-b border-line last:border-b-0">
                  <Link
                    to={studentLessonPath(item.id)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3 text-[13.5px] transition-colors',
                      isCurrent
                        ? 'text-accent bg-accent/10'
                        : 'text-[#c6cedb] hover:text-accent hover:bg-bg-2/60'
                    )}
                  >
                    <span className="flex-1 min-w-0">{item.title}</span>
                    <span className="text-[12px] text-muted shrink-0">{item.duration ?? 'PDF'}</span>
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
