import { Link } from 'react-router-dom';
import { courseProgress, describeCourse, useCourseTree, useLessonProgress } from '../../entities/course';
import { ROUTES, studentCoursePath } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { FormAlert } from '../../shared/ui/FormAlert';

export function StudentCoursesPage() {
  const { courses, isLoading, error } = useCourseTree({ publishedOnly: true });
  const { completed } = useLessonProgress();

  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink">Tus cursos</h1>
      <p className="text-muted text-[14px] mt-2">
        {isLoading ? 'Cargando…' : `${courses.length} ${courses.length === 1 ? 'curso' : 'cursos'} en tu membresía`}
      </p>

      {error && (
        <div className="mt-8">
          <FormAlert variant="error">No pudimos cargar tus cursos. Intenta de nuevo en un momento.</FormAlert>
        </div>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <div className="mt-9 bg-panel border border-line rounded-[18px] p-8 text-center">
          <p className="text-ink text-[15px]">Todavía no tienes cursos activos.</p>
          <p className="text-muted text-[13.5px] mt-1.5">Cuando tu membresía esté activa, aquí verás todo el contenido.</p>
          <Button to={ROUTES.checkoutPlan} variant="primary" className="mt-5">
            Ver planes
          </Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-9">
        {courses.map((course, index) => {
          const progress = courseProgress(course, completed);
          return (
            <Link
              key={course.id}
              to={studentCoursePath(course.id)}
              className="group flex flex-col bg-panel border border-line rounded-[18px] p-6 hover:border-accent/40 hover:-translate-y-1 transition-all duration-200"
            >
              <span className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">Curso {index + 1}</span>
              <span className="font-display font-bold text-[20px] text-ink mt-3 leading-snug group-hover:text-accent transition-colors">
                {course.title}
              </span>
              {course.description && (
                <span className="text-muted text-[13.5px] mt-2 line-clamp-3 text-pretty">{course.description}</span>
              )}
              <span className="mt-auto pt-5">
                <span className="flex items-center justify-between text-[12px] text-muted mb-2">
                  <span>{describeCourse(course)}</span>
                  <span className="text-ink">{progress}%</span>
                </span>
                <span className="block h-1.5 rounded-full bg-bg-2 overflow-hidden" aria-hidden="true">
                  <span className="block h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
