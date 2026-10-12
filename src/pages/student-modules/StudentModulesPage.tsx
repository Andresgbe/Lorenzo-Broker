import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ALL_LESSONS, COURSE_MODULES, describeModule, type CourseModule } from '../../entities/course';
import { studentLessonPath } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { TextField } from '../../shared/ui/TextField';
import { cn } from '../../shared/lib/cn';

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
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
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
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

function matchesQuery(module: CourseModule, query: string): CourseModule | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return module;
  if (module.title.toLowerCase().includes(needle)) return module;
  const lessons = module.lessons.filter((lesson) => lesson.title.toLowerCase().includes(needle));
  return lessons.length > 0 ? { ...module, lessons } : null;
}

export function StudentModulesPage() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(COURSE_MODULES[1]?.id ?? null);

  const visible = useMemo(
    () => COURSE_MODULES.map((module) => matchesQuery(module, query)).filter((m): m is CourseModule => m !== null),
    [query]
  );

  return (
    <Container className="py-12 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink">Módulos</h1>
          <p className="text-muted text-[14px] mt-2">
            {COURSE_MODULES.length} módulos · {ALL_LESSONS.length} clases
          </p>
        </div>
        <div className="w-full sm:w-[280px]">
          <TextField
            label="Buscar"
            type="search"
            placeholder="Busca una clase o módulo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-muted text-[15px] mt-10">No encontramos nada con “{query}”.</p>
      ) : (
        <div className="grid gap-3.5 mt-9">
          {visible.map((module) => {
            const isOpen = openId === module.id || query.trim().length > 0;
            return (
              <div key={module.id} className="bg-panel border border-line rounded-[18px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen && !query ? null : module.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                >
                  <span>
                    <span className="block text-[15px] text-ink">{module.title}</span>
                    <span className="block text-[12.5px] text-muted mt-1">{describeModule(module)}</span>
                  </span>
                  <ChevronIcon
                    className={cn('w-4 h-4 shrink-0 text-accent transition-transform', isOpen && 'rotate-180')}
                  />
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
                      <ul className="border-t border-line">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="border-b border-line last:border-b-0">
                            <Link
                              to={studentLessonPath(lesson.id)}
                              className="flex items-center gap-3 px-5 py-3 text-[14px] text-[#c6cedb] hover:text-accent hover:bg-bg-2/60 transition-colors"
                            >
                              {lesson.kind === 'pdf' ? (
                                <PdfIcon className="w-4 h-4 shrink-0 text-muted" />
                              ) : (
                                <PlayIcon className="w-3.5 h-3.5 shrink-0 text-muted" />
                              )}
                              <span className="flex-1 min-w-0">{lesson.title}</span>
                              <span className="text-[12.5px] text-muted shrink-0">
                                {lesson.duration ?? 'PDF'}
                              </span>
                            </Link>
                          </li>
                        ))}
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
