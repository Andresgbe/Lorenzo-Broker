import { Link } from 'react-router-dom';
import { describeCourse, reorderRows, updateCourse, useCourseTree } from '../../entities/course';
import { usePlanOptions } from '../../entities/plan';
import { useAdminAction } from '../../features/manage-courses';
import { AdminPageHeading } from '../../widgets/admin-shell';
import { ROUTES, adminCoursePath } from '../../shared/config/routes';
import { useDragReorder } from '../../shared/lib/useDragReorder';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { DragHandle } from '../../shared/ui/DragHandle';
import { FormAlert } from '../../shared/ui/FormAlert';
import { Switch } from '../../shared/ui/Switch';

export function AdminCoursesPage() {
  const { courses, isLoading, error, reload } = useCourseTree();
  const plans = usePlanOptions();
  const { run, isBusy, error: actionError } = useAdminAction();
  const { ordered, draggedId, rowProps } = useDragReorder(courses, 'courses', async (ids) => {
    if (await run(() => reorderRows('courses', ids))) await reload();
  });

  const planName = (id: string) => plans.find((plan) => plan.id === id)?.name ?? id;

  async function togglePublished(id: string, isPublished: boolean) {
    if (await run(() => updateCourse(id, { isPublished }))) await reload();
  }

  return (
    <>
      <AdminPageHeading
        title="Cursos"
        subtitle="Los cursos que incluye la membresía. Arrastra para cambiar el orden; entra a uno para editar sus módulos y clases."
        action={
          <Button to={ROUTES.adminCourseNew} variant="primary" size="sm">
            + Nuevo curso
          </Button>
        }
      />

      {(error || actionError) && (
        <div className="mb-5">
          <FormAlert variant="error">{actionError ?? error}</FormAlert>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted text-[14px]">Cargando cursos…</p>
      ) : courses.length === 0 ? (
        <div className="border border-dashed border-line-strong rounded-[18px] px-6 py-12 text-center">
          <p className="font-display font-bold text-[20px] text-ink">Todavía no hay cursos</p>
          <p className="text-muted text-[14px] mt-2">Crea el primero; luego le agregas módulos y clases.</p>
          <Button to={ROUTES.adminCourseNew} variant="primary" className="mt-6">
            Nuevo curso
          </Button>
        </div>
      ) : (
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
              <DragHandle scope="courses" label={`el curso ${course.title}`} />
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

              <Switch
                checked={course.isPublished}
                onChange={(checked) => void togglePublished(course.id, checked)}
                label={`Publicar el curso ${course.title}`}
                disabled={isBusy}
              />

              <Link to={adminCoursePath(course.id)} className="text-[13px] font-semibold text-accent hover:underline">
                Editar
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
