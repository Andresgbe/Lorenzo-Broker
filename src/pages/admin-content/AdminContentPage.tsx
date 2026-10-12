import { useState } from 'react';
import { COURSE_MODULES, describeModule, type Lesson } from '../../entities/course';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/TextField';
import { AdminPageHeading } from '../../widgets/admin-shell';
import { cn } from '../../shared/lib/cn';

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

export function AdminContentPage() {
  const [selected, setSelected] = useState<Lesson>(COURSE_MODULES[1].lessons[1]);

  return (
    <>
      <AdminPageHeading
        title="Contenido"
        action={<Button variant="primary">Nueva clase</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr] items-start">
        <nav className="bg-panel border border-line rounded-[18px] overflow-hidden">
          {COURSE_MODULES.map((module) => (
            <div key={module.id} className="border-b border-line last:border-b-0">
              <div className="px-5 py-3.5 bg-bg-2/60">
                <p className="text-[13.5px] text-ink">{module.title}</p>
                <p className="text-[11.5px] text-muted mt-0.5">{describeModule(module)}</p>
              </div>
              <ul>
                {module.lessons.map((lesson) => {
                  const isSelected = lesson.id === selected.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(lesson)}
                        aria-pressed={isSelected}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-5 py-2.5 text-left text-[13px] transition-colors cursor-pointer',
                          isSelected ? 'bg-accent/10 text-accent' : 'text-[#c6cedb] hover:bg-bg-2/60'
                        )}
                      >
                        {lesson.kind === 'pdf' ? (
                          <PdfIcon className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <PlayIcon className="w-3 h-3 shrink-0" />
                        )}
                        <span className="flex-1 min-w-0 truncate">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <section className="bg-panel border border-line rounded-[18px] p-6">
          <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-5">
            Editar {selected.kind === 'pdf' ? 'material' : 'clase'}
          </h2>

          <div className="flex flex-col gap-4">
            {/* key fuerza el remount al cambiar de clase, para que el defaultValue se refresque. */}
            <TextField key={`${selected.id}-title`} label="Título" defaultValue={selected.title} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="lesson-description" className="text-[13px] text-[#c6cedb]">
                Descripción
              </label>
              <textarea
                id="lesson-description"
                key={`${selected.id}-description`}
                rows={4}
                placeholder="Qué aprende el alumno en esta clase…"
                className="w-full bg-bg-2 border border-line rounded-[10px] px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/50 resize-y transition-colors focus:outline-none focus:border-accent"
              />
            </div>

            {selected.kind === 'video' ? (
              <>
                <TextField
                  key={`${selected.id}-video`}
                  label="Enlace del video"
                  placeholder="https://www.youtube.com/watch?v=…"
                  hint="Súbelo a YouTube como no listado y pega el enlace."
                />
                <TextField key={`${selected.id}-duration`} label="Duración" defaultValue={selected.duration ?? ''} placeholder="12:30" />
              </>
            ) : (
              <TextField
                key={`${selected.id}-file`}
                label="Archivo"
                defaultValue={`${selected.title}.pdf`}
                hint="La subida de archivos todavía no está conectada."
              />
            )}

            <div className="flex items-center gap-3 mt-2 pt-5 border-t border-line">
              <Button variant="primary">Guardar cambios</Button>
              <button
                type="button"
                className="text-[13px] text-red-400 hover:underline cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
