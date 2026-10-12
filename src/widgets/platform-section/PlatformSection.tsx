import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ALL_LESSONS, COURSE_MODULES, describeModule, type CourseModule } from '../../entities/course';
import { ROUTES } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { Button } from '../../shared/ui/Button';
import { MediaPlaceholder } from '../../shared/ui/MediaPlaceholder';
import { cn } from '../../shared/lib/cn';

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4Zm-2 7V6a2 2 0 1 1 4 0v3Z" />
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

function ModulePreview({ module }: { module: CourseModule }) {
  return (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <MediaPlaceholder
        icon={<PlayIcon className="w-6 h-6 fill-ink-inverse translate-x-[1px]" />}
        label="Captura próximamente"
        className="aspect-video w-full rounded-xl mb-6"
      />

      <h4 className="text-[15px] font-bold tracking-[1.2px] uppercase text-ink">{module.title}</h4>
      <p className="text-muted text-[13.5px] mt-1.5">{describeModule(module)}</p>

      <ul className="flex flex-col gap-2.5 mt-5">
        {module.lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center gap-3 text-[14px] text-[#c6cedb]">
            {lesson.kind === 'pdf' ? (
              <PdfIcon className="w-4 h-4 shrink-0 text-muted" />
            ) : (
              <PlayIcon className="w-3.5 h-3.5 shrink-0 text-muted" />
            )}
            <span className="flex-1 min-w-0">{lesson.title}</span>
            <span className="text-[12.5px] text-muted shrink-0">{lesson.duration ?? 'PDF'}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function LockedModule({ module }: { module: CourseModule }) {
  return (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full flex flex-col items-center text-center gap-4 py-6"
    >
      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-panel-2 border border-line">
        <LockIcon className="w-6 h-6 fill-muted" />
      </span>
      <div>
        <h4 className="text-[15px] font-bold uppercase tracking-[1.2px] text-ink">{module.title}</h4>
        <p className="text-muted text-[15px] mt-2 max-w-sm">
          {describeModule(module)}. Suscríbete para desbloquear este módulo.
        </p>
      </div>
      <Button to={ROUTES.checkoutPlan} variant="primary">
        Suscríbete
      </Button>
    </motion.div>
  );
}

export function PlatformSection() {
  const [selectedId, setSelectedId] = useState(COURSE_MODULES[0].id);
  const selected = COURSE_MODULES.find((module) => module.id === selectedId) ?? COURSE_MODULES[0];

  return (
    <section className="py-24 bg-bg-2 border-y border-line">
      <Container>
        <SectionHeading
          eyebrow="La plataforma"
          title={<>Todo el temario, <span className="text-accent">en un solo sitio</span></>}
          subtitle={`${COURSE_MODULES.length} módulos y ${ALL_LESSONS.length} clases, con las grabaciones y el material descargable siempre disponibles.`}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-[280px_1fr] bg-panel border border-line rounded-[20px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <nav className="bg-bg-2 border-b lg:border-b-0 lg:border-r border-line px-3 py-4">
            <p className="px-2 text-[10.5px] font-bold tracking-[2px] text-muted uppercase mb-2">
              Módulos
            </p>
            {COURSE_MODULES.map((module) => {
              const isSelected = module.id === selected.id;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setSelectedId(module.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center justify-between gap-2 w-full text-left px-2 py-2 rounded-lg transition-colors cursor-pointer',
                    isSelected ? 'text-accent bg-accent/10' : 'text-[#aab4c5] hover:text-ink'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm truncate">{module.title}</span>
                    <span className="block text-[11.5px] text-muted">{describeModule(module)}</span>
                  </span>
                  {!module.preview && <LockIcon className="w-3.5 h-3.5 fill-[#5b6577] shrink-0" />}
                </button>
              );
            })}
          </nav>

          <div className="px-6 py-9 lg:px-10 h-full flex items-center">
            <AnimatePresence mode="wait">
              {selected.preview ? (
                <ModulePreview key={selected.id} module={selected} />
              ) : (
                <LockedModule key={selected.id} module={selected} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
