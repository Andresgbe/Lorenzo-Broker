import { Link } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { courseLessons, courseProgress, describeCourse, useCourseTree, useLessonProgress } from '../../entities/course';
import { DEMO_MEMBERSHIP, daysUntil, formatDate } from '../../entities/membership';
import { ROUTES, studentCoursePath, studentLessonPath } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';

export function StudentHomePage() {
  const { user, viewAsStudent } = useAuth();
  const { courses, isLoading } = useCourseTree({ publishedOnly: viewAsStudent });
  const { completed } = useLessonProgress();
  const firstName = user?.fullName?.split(' ')[0] ?? 'de nuevo';
  // La membresía sigue siendo de ejemplo hasta conectar entitlements.
  const remaining = daysUntil(DEMO_MEMBERSHIP.expiresOn);

  // La primera clase sin completar, recorriendo los cursos en orden.
  const nextLesson = courses.flatMap(courseLessons).find((lesson) => !completed.has(lesson.id));

  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink">Hola, {firstName}</h1>
      <p className="text-muted text-[15px] mt-2">Qué bueno verte. Sigue aprendiendo a tu ritmo.</p>

      <div className="grid gap-5 lg:grid-cols-2 mt-9">
        <section className="bg-panel border border-accent/40 rounded-[18px] p-6 shadow-[0_0_50px_rgba(0,176,154,0.08)]">
          <span className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">Membresía activa</span>
          <p className="font-display font-bold text-[22px] text-ink mt-3">Plan {DEMO_MEMBERSHIP.planName}</p>
          <p className="text-muted text-[13.5px] mt-1.5">
            Vence el {formatDate(DEMO_MEMBERSHIP.expiresOn)} · {remaining} días restantes
          </p>
          <Link to={ROUTES.checkoutPlan} className="inline-block mt-5 text-[13px] text-accent hover:underline">
            Renovar o cambiar de plan
          </Link>
        </section>

        <section className="bg-panel border border-line rounded-[18px] p-6 flex flex-col items-start">
          <span className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">Sigue donde quedaste</span>
          <p className="font-display font-bold text-[22px] text-ink mt-3">{nextLesson ? nextLesson.title : 'Tus clases te esperan'}</p>
          <p className="text-muted text-[13.5px] mt-1.5 text-pretty">
            {nextLesson ? 'Tu siguiente clase pendiente.' : 'Todo el contenido de tu membresía, en un solo sitio.'}
          </p>
          <Button to={nextLesson ? studentLessonPath(nextLesson.id) : ROUTES.studentCourses} variant="primary" className="mt-5">
            {nextLesson ? 'Continuar' : 'Ver mis cursos'}
          </Button>
        </section>
      </div>

      <div className="flex items-baseline justify-between gap-4 mt-12 mb-5">
        <h2 className="font-display font-bold text-[20px] text-ink">Tus cursos</h2>
        <Link to={ROUTES.studentCourses} className="text-[13px] text-accent hover:underline">
          Ver todos
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted text-[14px]">Cargando…</p>
      ) : courses.length === 0 ? (
        <p className="text-muted text-[14px]">Todavía no tienes cursos activos.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const progress = courseProgress(course, completed);
            return (
              <Link
                key={course.id}
                to={studentCoursePath(course.id)}
                className="bg-panel border border-line rounded-[18px] p-5 hover:border-accent/40 transition-colors"
              >
                <span className="block text-[15px] text-ink leading-snug">{course.title}</span>
                <span className="block text-[12.5px] text-muted mt-2">
                  {describeCourse(course)} · {progress}%
                </span>
                <span className="block h-1 rounded-full bg-bg-2 overflow-hidden mt-3" aria-hidden="true">
                  <span className="block h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
