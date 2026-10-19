import { Link } from 'react-router-dom';
import { useAuth } from '../../entities/session';
import { ALL_LESSONS, COURSE_MODULES, describeModule } from '../../entities/course';
import { DEMO_MEMBERSHIP, daysUntil, formatDate } from '../../entities/membership';
import { ROUTES, studentLessonPath } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

const latestLessons = ALL_LESSONS.filter((lesson) => lesson.kind === 'video').slice(0, 3);

export function StudentHomePage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] ?? 'de nuevo';
  const remaining = daysUntil(DEMO_MEMBERSHIP.expiresOn);

  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink">Hola, {firstName}</h1>
      <p className="text-muted text-[15px] mt-2">Qué bueno verte. Sigue aprendiendo a tu ritmo.</p>

      <div className="grid gap-5 lg:grid-cols-2 mt-9">
        <section className="bg-panel border border-accent/40 rounded-[18px] p-6 shadow-[0_0_50px_rgba(37,233,138,0.08)]">
          <span className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">
            Membresía activa
          </span>
          <p className="font-display font-bold text-[22px] text-ink mt-3">Plan {DEMO_MEMBERSHIP.planName}</p>
          <p className="text-muted text-[13.5px] mt-1.5">
            Vence el {formatDate(DEMO_MEMBERSHIP.expiresOn)} · {remaining} días restantes
          </p>
          <Link
            to={ROUTES.checkoutPlan}
            className="inline-block mt-5 text-[13px] text-accent hover:underline"
          >
            Renovar o cambiar de plan
          </Link>
        </section>

        <section className="bg-panel border border-line rounded-[18px] p-6 flex flex-col items-start">
          <span className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent">Sigue donde quedaste</span>
          <p className="font-display font-bold text-[22px] text-ink mt-3">Tus clases te esperan</p>
          <p className="text-muted text-[13.5px] mt-1.5 text-pretty">
            Todas las clases en vivo, las grabaciones y el material, en un solo sitio.
          </p>
          <Button to={ROUTES.studentModules} variant="primary" className="mt-5">
            Ver los módulos
          </Button>
        </section>
      </div>

      <div className="flex items-baseline justify-between gap-4 mt-12 mb-5">
        <h2 className="font-display font-bold text-[20px] text-ink">Clases nuevas</h2>
        <Link to={ROUTES.studentModules} className="text-[13px] text-accent hover:underline">
          Ver todos los módulos
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {latestLessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={studentLessonPath(lesson.id)}
            className="group bg-panel border border-line rounded-[18px] overflow-hidden hover:border-accent/40 transition-colors"
          >
            <span className="flex items-center justify-center aspect-video bg-bg-2 border-b border-line">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/30 group-hover:bg-accent/20 transition-colors">
                <PlayIcon className="w-5 h-5 text-accent translate-x-[1px]" />
              </span>
            </span>
            <span className="block p-4">
              <span className="block text-[11px] font-bold uppercase tracking-[1.6px] text-muted">
                {lesson.duration}
              </span>
              <span className="block text-[14.5px] text-ink mt-1.5 leading-snug">{lesson.title}</span>
            </span>
          </Link>
        ))}
      </div>

      <h2 className="font-display font-bold text-[20px] text-ink mt-12 mb-5">Tus módulos</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COURSE_MODULES.map((module) => (
          <Link
            key={module.id}
            to={ROUTES.studentModules}
            className="bg-panel border border-line rounded-[18px] p-5 hover:border-accent/40 transition-colors"
          >
            <span className="block text-[14.5px] text-ink leading-snug">{module.title}</span>
            <span className="block text-[12.5px] text-muted mt-2">{describeModule(module)}</span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
