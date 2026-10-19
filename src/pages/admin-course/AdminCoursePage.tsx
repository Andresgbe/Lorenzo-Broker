import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  createLesson,
  createModule,
  deleteCourse,
  deleteModule,
  describeCourse,
  formatDuration,
  nextPosition,
  reorderRows,
  setCoursePlans,
  updateCourse,
  updateLesson,
  updateModule,
  useCourseTree,
  type Course,
  type CourseModule,
} from '../../entities/course';
import { usePlanOptions, type PlanOption } from '../../entities/plan';
import {
  CheckIcon,
  CourseFields,
  EyeIcon,
  PencilIcon,
  useAdminAction,
  type CourseFieldValues,
} from '../../features/manage-courses';
import { AdminTopBar } from '../../widgets/admin-shell';
import { ROUTES, adminLessonPath, studentCoursePath } from '../../shared/config/routes';
import { useDragReorder } from '../../shared/lib/useDragReorder';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { DragHandle } from '../../shared/ui/DragHandle';
import { FormAlert } from '../../shared/ui/FormAlert';
import { MenuButton } from '../../shared/ui/MenuButton';
import { Switch } from '../../shared/ui/Switch';

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

const sectionLabel = 'text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent';

// ---------------------------------------------------------------- datos del curso

interface CourseDetailsProps {
  course: Course;
  plans: PlanOption[];
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  onChanged: () => Promise<void>;
}

/** Resumen del curso; con "Editar" de la barra se convierte en formulario en el mismo lugar. */
function CourseDetails({ course, plans, isEditing, onEditingChange, onChanged }: CourseDetailsProps) {
  const [values, setValues] = useState<CourseFieldValues>({
    title: course.title,
    description: course.description,
    welcomeVideoId: course.welcomeVideoId ?? '',
    planIds: course.planIds,
  });
  const [titleError, setTitleError] = useState<string>();
  const { run, isBusy, error } = useAdminAction();

  const planNames = course.planIds.map((id) => plans.find((plan) => plan.id === id)?.name ?? id);

  async function handleSave() {
    const title = values.title.trim();
    if (!title) {
      setTitleError('El curso necesita un título.');
      return;
    }
    const ok = await run(async () => {
      await updateCourse(course.id, {
        title,
        description: values.description.trim(),
        welcomeVideoId: values.welcomeVideoId.trim() || null,
      });
      await setCoursePlans(course.id, values.planIds);
    });
    if (ok) {
      onEditingChange(false);
      await onChanged();
    }
  }

  if (isEditing) {
    return (
      <section className="bg-panel border border-accent/40 rounded-[18px] p-6 sm:p-8">
        <h2 className={`${sectionLabel} mb-6`}>Editar datos del curso</h2>
        <CourseFields
          autoFocus
          values={values}
          plans={plans}
          titleError={titleError}
          onChange={(patch) => {
            if (patch.title !== undefined) setTitleError(undefined);
            setValues((prev) => ({ ...prev, ...patch }));
          }}
        />
        {error && (
          <div className="mt-5">
            <FormAlert variant="error">{error}</FormAlert>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-7 pt-6 border-t border-line">
          <Button variant="primary" size="sm" onClick={() => void handleSave()} disabled={isBusy}>
            <CheckIcon className="w-4 h-4" />
            {isBusy ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEditingChange(false)}>
            Cancelar
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-panel border border-line rounded-[18px] p-6 sm:p-7">
      <p className="text-[12.5px] text-muted">
        {describeCourse(course)} ·{' '}
        {course.isPublished ? (
          <span className="text-accent">Publicado</span>
        ) : (
          <span>Borrador: los alumnos todavía no lo ven</span>
        )}
      </p>
      <p className={cn('mt-3 text-[15px] leading-relaxed text-pretty max-w-3xl', course.description ? 'text-[#c6cedb]' : 'text-muted italic')}>
        {course.description || 'Sin descripción. Agrégala con “Editar” para que el alumno sepa qué va a aprender.'}
      </p>
      <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-muted">
        <PlayIcon className="w-3 h-3" />
        Video de bienvenida:{' '}
        {course.welcomeVideoId ? (
          <span className="text-ink">cargado</span>
        ) : (
          <span>sin video. Agrégalo con “Editar”.</span>
        )}
      </p>
      <p className="mt-2 text-[12.5px] text-muted">
        Incluido en:{' '}
        {planNames.length > 0 ? (
          <span className="text-ink">{planNames.join(', ')}</span>
        ) : (
          <span className="text-gold">ningún plan (nadie lo verá)</span>
        )}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------- un módulo y sus clases

interface ModuleCardProps {
  course: Course;
  module: CourseModule;
  index: number;
  isDragging: boolean;
  dragProps: ReturnType<ReturnType<typeof useDragReorder>['rowProps']>;
  onChanged: () => Promise<void>;
}

function ModuleCard({ course, module, index, isDragging, dragProps, onChanged }: ModuleCardProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description);
  const [isDeleting, setIsDeleting] = useState(false);
  const { run, isBusy, error } = useAdminAction();
  const lessonsDrag = useDragReorder(module.lessons, `lessons-${module.id}`, async (ids) => {
    if (await run(() => reorderRows('lessons', ids))) await onChanged();
  });

  async function save(patch: Parameters<typeof updateModule>[1]) {
    if (await run(() => updateModule(module.id, patch))) await onChanged();
  }

  async function handleAddLesson() {
    let lessonId = '';
    const ok = await run(async () => {
      lessonId = await createLesson(module.id, 'Nueva clase', nextPosition(module.lessons));
    });
    if (ok) navigate(adminLessonPath(course.id, lessonId));
  }

  async function handleDelete() {
    const ok = await run(() => deleteModule(module.id));
    setIsDeleting(false);
    if (ok) await onChanged();
  }

  return (
    <li
      {...dragProps}
      className={cn(
        'bg-panel border rounded-[18px] transition-all',
        isDragging ? 'border-accent shadow-[0_0_24px_rgba(37,233,138,0.2)] opacity-90' : 'border-line'
      )}
    >
      <div className="flex flex-wrap items-start gap-3 pl-3 pr-5 sm:pr-6 py-5 border-b border-line">
        <DragHandle scope="modules" label={`el módulo ${module.title}`} className="mt-1" />
        <span className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-panel-2 border border-line text-[13px] font-bold text-muted shrink-0">
          {index + 1}
        </span>

        <div className="flex-1 min-w-[220px] flex flex-col gap-1">
          <input
            aria-label={`Título del módulo ${index + 1}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => {
              if (!title.trim()) setTitle(module.title);
              else if (title.trim() !== module.title) void save({ title: title.trim() });
            }}
            className="w-full bg-transparent outline-none border-b border-dashed border-transparent hover:border-line focus:border-accent font-display font-bold text-[19px] text-ink py-1 transition-colors"
          />
          <textarea
            aria-label={`Descripción del módulo ${index + 1}`}
            value={description}
            rows={1}
            placeholder="Agrega una descripción (opcional)"
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => {
              if (description.trim() !== module.description) void save({ description: description.trim() });
            }}
            className="w-full bg-transparent outline-none border-b border-dashed border-transparent hover:border-line focus:border-accent text-[13.5px] text-muted placeholder:text-muted/50 resize-none field-sizing-content transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 mt-1">
          <Switch
            checked={module.isPublished}
            onChange={(checked) => void save({ isPublished: checked })}
            label={`Publicar el módulo ${module.title}`}
            disabled={isBusy}
          />
          <MenuButton
            label={`Más acciones del módulo ${module.title}`}
            items={[{ label: 'Eliminar módulo', tone: 'danger', onSelect: () => setIsDeleting(true) }]}
          />
        </div>
      </div>

      {error && (
        <div className="px-5 sm:px-6 pt-4">
          <FormAlert variant="error">{error}</FormAlert>
        </div>
      )}

      {module.lessons.length === 0 ? (
        <div className="px-5 sm:px-6 py-6 text-center">
          <p className="text-[13.5px] text-muted">Este módulo todavía no tiene clases.</p>
          <button
            type="button"
            onClick={() => void handleAddLesson()}
            disabled={isBusy}
            className="mt-2 text-[13px] font-semibold text-accent hover:underline cursor-pointer disabled:opacity-40"
          >
            + Agregar la primera clase
          </button>
        </div>
      ) : (
        <ol>
          {lessonsDrag.ordered.map((lesson, lessonIndex) => (
            <li
              key={lesson.id}
              {...lessonsDrag.rowProps(lesson.id)}
              className={cn(
                'flex flex-wrap items-center gap-3 pl-3 pr-5 sm:pr-6 py-2.5 border-b border-line last:border-b-0 transition-colors',
                lessonsDrag.draggedId === lesson.id ? 'bg-panel-2 outline outline-1 outline-accent' : 'hover:bg-bg-2/40'
              )}
            >
              <DragHandle scope={`lessons-${module.id}`} label={`la clase ${lesson.title}`} />
              <span className="w-6 text-[12px] text-muted shrink-0">{lessonIndex + 1}.</span>
              <Link
                to={adminLessonPath(course.id, lesson.id)}
                className="flex-1 min-w-[180px] text-[14px] text-[#c6cedb] hover:text-accent transition-colors"
              >
                {lesson.title}
              </Link>
              <span className="flex items-center gap-3 text-[12px] text-muted">
                {lesson.bunnyVideoId ? (
                  <span className="flex items-center gap-1" title="Tiene video">
                    <PlayIcon className="w-3 h-3" />
                    {formatDuration(lesson.durationSeconds) ?? 'Video'}
                  </span>
                ) : (
                  <span>Sin video</span>
                )}
                {lesson.attachments.length > 0 && (
                  <span className="flex items-center gap-1" title="Material en PDF">
                    <PdfIcon className="w-3.5 h-3.5" />
                    {lesson.attachments.length}
                  </span>
                )}
              </span>
              <Switch
                checked={lesson.isPublished}
                onChange={(checked) => void run(() => updateLesson(lesson.id, { isPublished: checked })).then((ok) => (ok ? onChanged() : undefined))}
                label={`Publicar la clase ${lesson.title}`}
                disabled={isBusy}
              />
              <Link to={adminLessonPath(course.id, lesson.id)} className="text-[13px] font-semibold text-accent hover:underline">
                Editar
              </Link>
            </li>
          ))}
        </ol>
      )}

      {module.lessons.length > 0 && (
        <div className="px-5 sm:px-6 py-3.5 border-t border-line bg-bg-2/40 rounded-b-[18px]">
          <button
            type="button"
            onClick={() => void handleAddLesson()}
            disabled={isBusy}
            className="text-[13px] font-semibold text-accent hover:underline cursor-pointer disabled:opacity-40"
          >
            + Agregar clase
          </button>
        </div>
      )}

      <ConfirmDialog
        open={isDeleting}
        title={`¿Eliminar “${module.title}”?`}
        description={`Se borran sus ${module.lessons.length} clases y los PDF. Los alumnos dejan de verlas. No se puede deshacer.`}
        confirmLabel="Eliminar módulo"
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsDeleting(false)}
        isBusy={isBusy}
      />
    </li>
  );
}

// ---------------------------------------------------------------- página

export function AdminCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, isLoading, error, reload } = useCourseTree();
  const plans = usePlanOptions();
  const { run, isBusy, error: actionError } = useAdminAction();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const course = courses.find((item) => item.id === courseId);
  const modulesDrag = useDragReorder(course?.modules ?? [], 'modules', async (ids) => {
    if (await run(() => reorderRows('modules', ids))) await reload();
  });

  if (isLoading) return <p className="text-muted text-[14px]">Cargando curso…</p>;
  if (error) return <FormAlert variant="error">{error}</FormAlert>;
  if (!course) return <Navigate to={ROUTES.adminCourses} replace />;

  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  async function handleAddModule() {
    if (!course) return;
    if (await run(() => createModule(course.id, `Módulo ${course.modules.length + 1}`, nextPosition(course.modules)))) await reload();
  }

  async function togglePublished() {
    if (!course) return;
    if (await run(() => updateCourse(course.id, { isPublished: !course.isPublished }))) await reload();
  }

  async function handleDelete() {
    if (!course) return;
    const ok = await run(() => deleteCourse(course.id));
    setIsDeleting(false);
    if (ok) navigate(ROUTES.adminCourses);
  }

  return (
    <div className="max-w-5xl">
      <AdminTopBar
        backTo={ROUTES.adminCourses}
        backLabel="Volver a Cursos"
        crumbs={[{ label: 'Cursos', to: ROUTES.adminCourses }, { label: course.title }]}
        actions={
          <>
            <Button to={studentCoursePath(course.id)} variant="ghost" size="sm">
              <EyeIcon className="w-4 h-4" />
              Vista previa
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} disabled={isEditing}>
              <PencilIcon className="w-4 h-4" />
              Editar
            </Button>
            {course.isPublished ? (
              <Button variant="ghost" size="sm" onClick={() => void togglePublished()} disabled={isBusy}>
                Pasar a borrador
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => void togglePublished()} disabled={isBusy}>
                <CheckIcon className="w-4 h-4" />
                Publicar
              </Button>
            )}
            <MenuButton
              label="Más acciones del curso"
              items={[{ label: 'Eliminar curso', tone: 'danger', onSelect: () => setIsDeleting(true) }]}
            />
          </>
        }
      />

      <h1 className="font-display font-bold text-[clamp(26px,3.4vw,34px)] text-ink text-balance mb-5">{course.title}</h1>

      {actionError && (
        <div className="mb-4">
          <FormAlert variant="error">{actionError}</FormAlert>
        </div>
      )}

      <CourseDetails
        key={`${course.id}-${course.title}-${course.description}-${course.planIds.join()}`}
        course={course}
        plans={plans}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        onChanged={reload}
      />

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className={sectionLabel}>Módulos y clases</h2>
          {course.modules.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => void handleAddModule()} disabled={isBusy}>
              + Agregar módulo
            </Button>
          )}
        </div>

        {course.modules.length === 0 ? (
          <div className="border border-dashed border-line-strong rounded-[18px] px-6 py-12 text-center">
            <p className="font-display font-bold text-[20px] text-ink">Paso 2: arma el temario</p>
            <p className="text-muted text-[14px] mt-2 max-w-md mx-auto text-pretty">
              Agrega el primer módulo y dentro de él sus clases. Puedes reordenarlos arrastrando cuando quieras.
            </p>
            <Button variant="primary" onClick={() => void handleAddModule()} disabled={isBusy} className="mt-6">
              Agregar el primer módulo
            </Button>
          </div>
        ) : (
          <ol className="grid gap-4">
            {modulesDrag.ordered.map((module, index) => (
              <ModuleCard
                key={module.id}
                course={course}
                module={module}
                index={index}
                isDragging={modulesDrag.draggedId === module.id}
                dragProps={modulesDrag.rowProps(module.id)}
                onChanged={reload}
              />
            ))}
          </ol>
        )}
      </section>

      <ConfirmDialog
        open={isDeleting}
        title={`¿Eliminar “${course.title}”?`}
        description={`Se borran sus ${course.modules.length} módulos, ${lessonCount} clases y los PDF. Los alumnos dejan de verlo. No se puede deshacer.`}
        confirmLabel="Eliminar curso"
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsDeleting(false)}
        isBusy={isBusy}
      />
    </div>
  );
}
