import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  courseLessons,
  courseProgress,
  describeCourse,
  describeModule,
  formatDuration,
  useCourseTree,
  useLessonProgress,
} from '../../entities/course';
import { ROUTES, studentLessonPath } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { MediaPlaceholder } from '../../shared/ui/MediaPlaceholder';
import { cn } from '../../shared/lib/cn';

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
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

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function StudentCoursePage() {
  const { courseId } = useParams();
  const { courses, isLoading } = useCourseTree();
  const { completed } = useLessonProgress();
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <Container className="py-12 md:py-16">
        <p className="text-muted text-[14px]">Cargando curso…</p>
      </Container>
    );
  }

  const course = courses.find((item) => item.id === courseId);
  if (!course) return <Navigate to={ROUTES.studentCourses} replace />;

  const progress = courseProgress(course, completed);
  const firstPending = courseLessons(course).find((lesson) => !completed.has(lesson.id)) ?? courseLessons(course)[0];

  function toggle(moduleId: string) {
    setClosedIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  return (
    <Container className="py-12 md:py-16">
      <nav className="text-[12.5px] text-muted mb-6">
        <Link to={ROUTES.studentCourses} className="hover:text-accent transition-colors">
          ← Tus cursos
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink text-balance">{course.title}</h1>
          {course.description && <p className="text-muted text-[15px] leading-relaxed mt-3 text-pretty">{course.description}</p>}
          <p className="text-muted text-[13px] mt-3">{describeCourse(course)}</p>
        </div>

        <div className="w-full lg:w-[280px] bg-panel border border-line rounded-[18px] p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">Tu progreso</span>
            <span className="font-display font-bold text-[22px] text-ink">{progress}%</span>
          </div>
          <span className="block h-1.5 rounded-full bg-bg-2 overflow-hidden mt-3" aria-hidden="true">
            <span className="block h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
          </span>
          {firstPending && (
            <Button to={studentLessonPath(firstPending.id)} variant="primary" className="w-full mt-5">
              {progress === 0 ? 'Empezar' : progress === 100 ? 'Repasar' : 'Continuar'}
            </Button>
          )}
        </div>
      </div>

      {course.welcomeVideoId && (
        <section aria-labelledby="welcome-video" className="mt-10">
          <h2 id="welcome-video" className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-4">
            Bienvenida al curso
          </h2>
          {/* Igual que en la clase: el reproductor de Bunny espera la URL firmada del servidor
              (Edge Function, pendiente). Hasta entonces se muestra el marcador. */}
          <MediaPlaceholder
            icon={<PlayIcon className="w-6 h-6 fill-ink-inverse translate-x-[1px]" />}
            label="Video en preparación"
            className="aspect-video w-full max-w-4xl rounded-[18px] border border-line"
          />
        </section>
      )}

      {course.modules.length === 0 ? (
        <p className="text-muted text-[15px] mt-10">Este curso todavía no tiene clases.</p>
      ) : (
        <div className="grid gap-3.5 mt-10">
          {course.modules.map((module, index) => {
            const isOpen = !closedIds.has(module.id);
            const done = module.lessons.filter((lesson) => completed.has(lesson.id)).length;
            return (
              <div key={module.id} className="bg-panel border border-line rounded-[18px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(module.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                >
                  <span>
                    <span className="block text-[10.5px] font-bold uppercase tracking-[1.8px] text-muted">Módulo {index + 1}</span>
                    <span className="block text-[15.5px] text-ink mt-1">{module.title}</span>
                    <span className="block text-[12.5px] text-muted mt-1">
                      {describeModule(module)} · {done}/{module.lessons.length} completadas
                    </span>
                  </span>
                  <ChevronIcon className={cn('w-4 h-4 shrink-0 text-accent transition-transform', isOpen && 'rotate-180')} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      {module.description && (
                        <p className="px-5 pb-4 -mt-1 text-[13.5px] text-muted text-pretty">{module.description}</p>
                      )}
                      <ul className="border-t border-line">
                        {module.lessons.map((lesson) => {
                          const isDone = completed.has(lesson.id);
                          return (
                            <li key={lesson.id} className="border-b border-line last:border-b-0">
                              <Link
                                to={studentLessonPath(lesson.id)}
                                className="flex items-center gap-3 px-5 py-3 text-[14px] text-[#c6cedb] hover:text-accent hover:bg-bg-2/60 transition-colors"
                              >
                                <span
                                  className={cn(
                                    'flex items-center justify-center w-6 h-6 rounded-full border shrink-0',
                                    isDone ? 'bg-accent border-accent text-ink-inverse' : 'border-line text-muted'
                                  )}
                                >
                                  {isDone ? <CheckIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-2.5 h-2.5 translate-x-[1px]" />}
                                </span>
                                <span className="flex-1 min-w-0">
                                  {lesson.title}
                                  {isDone && <span className="sr-only"> (completada)</span>}
                                </span>
                                <span className="text-[12.5px] text-muted shrink-0">
                                  {formatDuration(lesson.durationSeconds) ?? (lesson.attachments.length > 0 ? 'PDF' : '')}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}
