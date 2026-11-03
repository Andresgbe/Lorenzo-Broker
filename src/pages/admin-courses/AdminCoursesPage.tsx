import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createCourseLevel,
  deleteCourseLevel,
  describeCourse,
  groupCoursesByLevel,
  nextPosition,
  reorderRows,
  updateCourse,
  updateCourseLevel,
  useCourseLevels,
  useCourseTree,
  type Course,
  type CourseLevel,
} from '../../entities/course';
import { usePlanOptions } from '../../entities/plan';
import { useAdminAction } from '../../features/manage-courses';
import { AdminPageHeading } from '../../widgets/admin-shell';
import { ROUTES, adminCoursePath } from '../../shared/config/routes';
import { useDragReorder } from '../../shared/lib/useDragReorder';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { DragHandle } from '../../shared/ui/DragHandle';
import { FormAlert } from '../../shared/ui/FormAlert';
import { MenuButton } from '../../shared/ui/MenuButton';
import { Switch } from '../../shared/ui/Switch';
import { inputClasses } from '../../shared/ui/TextField';

// ---------------------------------------------------------------- los cursos de un nivel

interface CourseListProps {
  courses: Course[];
  /** Separa el arrastre de cada lista: un curso se ordena dentro de su nivel. */
  scope: string;
  levels: CourseLevel[];
  onChanged: () => Promise<void>;
}

function CourseList({ courses, scope, levels, onChanged }: CourseListProps) {
  const plans = usePlanOptions();
  const { run, isBusy, error } = useAdminAction();
  const { ordered, draggedId, rowProps } = useDragReorder(courses, scope, async (ids) => {
    if (await run(() => reorderRows('courses', ids))) await onChanged();
  });

  const planName = (id: string) => plans.find((plan) => plan.id === id)?.name ?? id;

  async function change(id: string, patch: Parameters<typeof updateCourse>[1]) {
    if (await run(() => updateCourse(id, patch))) await onChanged();
  }

  return (
    <>
      {error && (
        <div className="mb-3">
          <FormAlert variant="error">{error}</FormAlert>
        </div>
      )}
      <ol className="grid gap-3">
        {ordered.map((course, index) => (
          <li
            key={course.id}
            {...rowProps(course.id)}
            className={cn(
              'flex flex-wrap items-center gap-4 bg-panel border rounded-[18px] pl-3 pr-5 py-4 transition-all',
              draggedId === course.id
                ? 'border-accent shadow-[0_0_24px_rgba(0,176,154,0.2)] opacity-90'
                : 'border-line hover:border-accent/40'
            )}
          >
            <DragHandle scope={scope} label={`el curso ${course.title}`} />
            <span className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-panel-2 border border-line text-[13px] font-bold text-muted shrink-0">
              {index + 1}
            </span>

            <Link to={adminCoursePath(course.id)} className="flex-1 min-w-[200px] group">
              <span className="block text-[15.5px] text-ink group-hover:text-accent transition-colors">{course.title}</span>
              <span className="block text-[12.5px] text-muted mt-1">
                {describeCourse(course)}
                {course.planIds.length > 0 ? ` · ${course.planIds.map(planName).join(', ')}` : ' · Ningún plan lo incluye'}
              </span>
            </Link>

            {levels.length > 0 && (
              <select
                aria-label={`Nivel del curso ${course.title}`}
                value={course.levelId ?? ''}
                disabled={isBusy}
                onChange={(event) => void change(course.id, { levelId: event.target.value || null })}
                className={cn(inputClasses, 'w-auto py-2 text-[13px]')}
              >
                <option value="">Sin nivel</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.title}
                  </option>
                ))}
              </select>
            )}

            <Switch
              checked={course.isPublished}
              onChange={(checked) => void change(course.id, { isPublished: checked })}
              label={`Publicar el curso ${course.title}`}
              disabled={isBusy}
            />

            <Link to={adminCoursePath(course.id)} className="text-[13px] font-semibold text-accent hover:underline">
              Editar
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

// ---------------------------------------------------------------- un nivel

// Preferencia de este navegador: los niveles minimizados siguen así al volver.
const COLLAPSED_LEVELS_KEY = 'lb:admin-collapsed-levels';

function readCollapsedLevels(): string[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(COLLAPSED_LEVELS_KEY) ?? '[]');
    return Array.isArray(stored) ? (stored as string[]) : [];
  } catch {
    return [];
  }
}

function writeLevelCollapsed(levelId: string, isCollapsed: boolean) {
  const others = readCollapsedLevels().filter((id) => id !== levelId);
  try {
    window.localStorage.setItem(COLLAPSED_LEVELS_KEY, JSON.stringify(isCollapsed ? [...others, levelId] : others));
  } catch {
    // Sin almacenamiento (modo privado): vale hasta recargar.
  }
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

interface LevelSectionProps {
  level: CourseLevel;
  courses: Course[];
  levels: CourseLevel[];
  isDragging: boolean;
  dragProps: ReturnType<ReturnType<typeof useDragReorder>['rowProps']>;
  onCoursesChanged: () => Promise<void>;
  onLevelsChanged: () => Promise<void>;
}

function LevelSection({ level, courses, levels, isDragging, dragProps, onCoursesChanged, onLevelsChanged }: LevelSectionProps) {
  const [title, setTitle] = useState(level.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => readCollapsedLevels().includes(level.id));
  const { run, isBusy, error } = useAdminAction();

  function toggleCollapsed() {
    writeLevelCollapsed(level.id, !isCollapsed);
    setIsCollapsed(!isCollapsed);
  }

  async function saveTitle() {
    const next = title.trim();
    if (!next) {
      setTitle(level.title);
      return;
    }
    if (next !== level.title && (await run(() => updateCourseLevel(level.id, { title: next })))) await onLevelsChanged();
  }

  async function remove() {
    const ok = await run(() => deleteCourseLevel(level.id));
    setIsDeleting(false);
    if (ok) await Promise.all([onLevelsChanged(), onCoursesChanged()]);
  }

  return (
    <li {...dragProps} className={cn('rounded-[18px] transition-opacity', isDragging && 'opacity-70')}>
      <div className="flex items-center gap-3 mb-3">
        <DragHandle scope="levels" label={`el nivel ${level.title}`} />
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? 'Expandir' : 'Minimizar'} el nivel ${level.title}`}
          title={isCollapsed ? 'Expandir' : 'Minimizar'}
          className="flex items-center justify-center w-9 h-9 shrink-0 rounded-[10px] border border-line-strong text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer"
        >
          <ChevronIcon className={cn('w-5 h-5 transition-transform', isCollapsed && '-rotate-90')} />
        </button>
        <input
          aria-label={`Título del nivel ${level.title}`}
          value={title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => void saveTitle()}
          className="flex-1 min-w-0 bg-transparent outline-none border-b border-dashed border-transparent hover:border-line focus:border-accent font-display font-bold text-[21px] text-ink py-1 transition-colors"
        />
        <span className="text-[12.5px] text-muted whitespace-nowrap">
          {courses.length === 1 ? '1 curso' : `${courses.length} cursos`}
        </span>
        <MenuButton
          label={`Más acciones del nivel ${level.title}`}
          items={[{ label: 'Eliminar nivel', tone: 'danger', onSelect: () => setIsDeleting(true) }]}
        />
      </div>

      {error && (
        <div className="mb-3">
          <FormAlert variant="error">{error}</FormAlert>
        </div>
      )}

      {!isCollapsed &&
        (courses.length === 0 ? (
          <p className="border border-dashed border-line-strong rounded-[18px] px-5 py-6 text-center text-[13.5px] text-muted">
            Este nivel no tiene cursos. Asígnaselo a un curso con su selector de nivel.
          </p>
        ) : (
          <CourseList courses={courses} scope={`courses-${level.id}`} levels={levels} onChanged={onCoursesChanged} />
        ))}

      <ConfirmDialog
        open={isDeleting}
        title={`¿Eliminar “${level.title}”?`}
        description={`Sus ${courses.length} cursos no se borran: quedan sin nivel y los alumnos los siguen viendo.`}
        confirmLabel="Eliminar nivel"
        onConfirm={() => void remove()}
        onCancel={() => setIsDeleting(false)}
        isBusy={isBusy}
      />
    </li>
  );
}

// ---------------------------------------------------------------- página

export function AdminCoursesPage() {
  const { courses, isLoading, error, reload } = useCourseTree();
  const { levels, isLoading: isLoadingLevels, reload: reloadLevels } = useCourseLevels();
  const { run, isBusy, error: actionError } = useAdminAction();
  const levelsDrag = useDragReorder(levels, 'levels', async (ids) => {
    if (await run(() => reorderRows('course_levels', ids))) await reloadLevels();
  });

  async function addLevel() {
    const title = `Nivel ${levels.length + 1}`;
    if (await run(() => createCourseLevel(title, nextPosition(levels)))) await reloadLevels();
  }

  const coursesOf = (levelId: string) => courses.filter((course) => course.levelId === levelId);
  const withoutLevel = groupCoursesByLevel(courses, levels).find((group) => group.level === null)?.courses ?? [];

  return (
    <>
      <AdminPageHeading
        title="Cursos"
        subtitle="Los cursos de la membresía, por nivel. Cambia el título de un nivel escribiendo encima; arrastra para ordenar."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => void addLevel()} disabled={isBusy}>
              + Nuevo nivel
            </Button>
            <Button to={ROUTES.adminCourseNew} variant="primary" size="sm">
              + Nuevo curso
            </Button>
          </div>
        }
      />

      {(error || actionError) && (
        <div className="mb-5">
          <FormAlert variant="error">{actionError ?? error}</FormAlert>
        </div>
      )}

      {isLoading || isLoadingLevels ? (
        <p className="text-muted text-[14px]">Cargando cursos…</p>
      ) : courses.length === 0 && levels.length === 0 ? (
        <div className="border border-dashed border-line-strong rounded-[18px] px-6 py-12 text-center">
          <p className="font-display font-bold text-[20px] text-ink">Todavía no hay cursos</p>
          <p className="text-muted text-[14px] mt-2">Crea el primero; luego le agregas módulos y clases.</p>
          <Button to={ROUTES.adminCourseNew} variant="primary" className="mt-6">
            Nuevo curso
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-9">
          <ol className="flex flex-col gap-9">
            {levelsDrag.ordered.map((level) => (
              <LevelSection
                key={level.id}
                level={level}
                courses={coursesOf(level.id)}
                levels={levels}
                isDragging={levelsDrag.draggedId === level.id}
                dragProps={levelsDrag.rowProps(level.id)}
                onCoursesChanged={reload}
                onLevelsChanged={reloadLevels}
              />
            ))}
          </ol>

          {withoutLevel.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-[21px] text-ink mb-3">Sin nivel</h2>
              <CourseList courses={withoutLevel} scope="courses-none" levels={levels} onChanged={reload} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
