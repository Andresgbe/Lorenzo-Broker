import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse, nextPosition, useCourseTree } from '../../entities/course';
import { usePlanOptions } from '../../entities/plan';
import { CheckIcon, CourseFields, useAdminAction, type CourseFieldValues } from '../../features/manage-courses';
import { AdminPageHeading, AdminTopBar } from '../../widgets/admin-shell';
import { ROUTES, adminCoursePath } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { FormAlert } from '../../shared/ui/FormAlert';

/** Paso 1: el curso existe recién cuando tiene título. Los módulos y clases se agregan en su página. */
export function AdminCourseNewPage() {
  const navigate = useNavigate();
  const { courses } = useCourseTree();
  const plans = usePlanOptions();
  const { run, isBusy, error } = useAdminAction();
  const [values, setValues] = useState<CourseFieldValues>({
    title: '',
    description: '',
    welcomeVideoId: '',
    planIds: [],
  });
  const [plansTouched, setPlansTouched] = useState(false);
  const [titleError, setTitleError] = useState<string>();

  // Hasta que el admin elija, el curso va en los planes de suscripción activos.
  const defaultPlanIds = plans.filter((plan) => plan.kind === 'subscription' && plan.isActive).map((plan) => plan.id);
  const shown = plansTouched ? values : { ...values, planIds: defaultPlanIds };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const title = shown.title.trim();
    if (!title) {
      setTitleError('Escribe el título del curso.');
      return;
    }
    let courseId = '';
    const ok = await run(async () => {
      courseId = await createCourse(
        {
          title,
          description: shown.description.trim(),
          welcomeVideoId: shown.welcomeVideoId.trim() || null,
          planIds: shown.planIds,
        },
        nextPosition(courses)
      );
    });
    if (ok) navigate(adminCoursePath(courseId), { replace: true });
  }

  return (
    <div className="max-w-3xl">
      <AdminTopBar
        backTo={ROUTES.adminCourses}
        backLabel="Volver a Cursos"
        crumbs={[{ label: 'Cursos', to: ROUTES.adminCourses }, { label: 'Nuevo curso' }]}
      />
      <AdminPageHeading
        title="Nuevo curso"
        subtitle="Paso 1 de 2: los datos del curso. Al crearlo podrás agregarle módulos y clases."
      />

      <form noValidate onSubmit={(event) => void handleSubmit(event)} className="bg-panel border border-line rounded-[18px] p-6 sm:p-8">
        <CourseFields
          autoFocus
          values={shown}
          plans={plans}
          titleError={titleError}
          onChange={(patch) => {
            if (patch.planIds) setPlansTouched(true);
            if (patch.title !== undefined) setTitleError(undefined);
            setValues({ ...shown, ...patch });
          }}
        />

        <p className="text-[12.5px] text-muted mt-6">
          El curso se crea como <span className="text-ink">borrador</span>: los alumnos no lo ven hasta que lo publiques.
        </p>

        {error && (
          <div className="mt-5">
            <FormAlert variant="error">{error}</FormAlert>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-7 pt-6 border-t border-line">
          <Button type="submit" variant="primary" size="sm" disabled={isBusy}>
            <CheckIcon className="w-4 h-4" />
            {isBusy ? 'Creando…' : 'Crear curso'}
          </Button>
          <Button to={ROUTES.adminCourses} variant="ghost" size="sm">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
