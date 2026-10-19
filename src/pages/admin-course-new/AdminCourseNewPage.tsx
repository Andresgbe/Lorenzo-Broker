import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse, nextPosition, useCourseTree } from '../../entities/course';
import { usePlanOptions } from '../../entities/plan';
import { CheckIcon, CloseButton, CourseFields, useAdminAction, type CourseFieldValues } from '../../features/manage-courses';
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
    <div className="max-w-3xl mx-auto">
      <AdminTopBar
        backTo={ROUTES.adminCourses}
        backLabel="Volver a Cursos"
        crumbs={[{ label: 'Cursos', to: ROUTES.adminCourses }, { label: 'Nuevo curso' }]}
      />
      <AdminPageHeading
        title="Nuevo curso"
        subtitle="Paso 1 de 2: los datos del curso. Al crearlo podrás agregarle módulos y clases."
      />

      <form noValidate onSubmit={(event) => void handleSubmit(event)} className="relative bg-panel border border-line rounded-[18px] px-6 sm:px-8 pb-6 sm:pb-8 pt-20">
        <CloseButton
          to={ROUTES.adminCourses}
          label="Cancelar y volver a Cursos"
          confirmTitle="¿Descartar el curso nuevo?"
          confirmDescription="El curso no se crea y lo que escribiste se pierde."
        />
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

        <div className="flex justify-center mt-7 pt-6 border-t border-line">
          <Button type="submit" variant="primary" size="sm" disabled={isBusy}>
            <CheckIcon className="w-4 h-4" />
            {isBusy ? 'Creando…' : 'Crear curso'}
          </Button>
        </div>
      </form>
    </div>
  );
}
