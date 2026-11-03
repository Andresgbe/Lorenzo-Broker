import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCourseTree } from '../../entities/course';
import { createThread, useForumAction, useForumThreads } from '../../entities/forum';
import { formatDateTimeCaracas } from '../../entities/payment';
import { useAuth } from '../../entities/session';
import { ROUTES, studentCoursePath, studentForumThreadPath } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';
import { FormAlert } from '../../shared/ui/FormAlert';
import { Modal } from '../../shared/ui/Modal';
import { PageTopBar } from '../../shared/ui/PageTopBar';
import { StatusPill } from '../../shared/ui/StatusPill';
import { TextField, inputClasses } from '../../shared/ui/TextField';

const TITLE_MIN = 3;
const TITLE_MAX = 160;
const BODY_MAX = 5000;

function NewThreadModal({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const { run, isBusy, error } = useForumAction();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      title: title.trim().length < TITLE_MIN ? 'Escribe un título, de al menos 3 letras.' : undefined,
      body: body.trim() ? undefined : 'Escribe tu pregunta o comentario.',
    };
    setErrors(next);
    if (next.title || next.body) return;
    let threadId = '';
    const ok = await run(async () => {
      threadId = await createThread(courseId, title.trim(), body.trim());
    });
    if (ok) navigate(studentForumThreadPath(courseId, threadId));
  }

  return (
    <Modal open title="Nuevo hilo" description="Pregunta o comparte algo con los demás alumnos del curso." onClose={onClose}>
      <form noValidate onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
        <TextField
          label="Título"
          placeholder="Ej. ¿Cómo calculo mi fondo de emergencia?"
          maxLength={TITLE_MAX}
          value={title}
          error={errors.title}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
        />
        <TextField
          label="Mensaje"
          error={errors.body}
          control={({ id, describedBy, invalid }) => (
            <textarea
              id={id}
              rows={5}
              maxLength={BODY_MAX}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setErrors((prev) => ({ ...prev, body: undefined }));
              }}
              className={cn(inputClasses, 'resize-y', invalid && 'border-red-500/60')}
            />
          )}
        />
        {error && <FormAlert variant="error">{error}</FormAlert>}
        <div className="flex justify-end mt-2">
          <Button type="submit" size="sm" variant="primary" disabled={isBusy}>
            {isBusy ? 'Publicando…' : 'Publicar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Foro de un curso: la lista de hilos. Lo ve quien tiene acceso al curso; RLS lo garantiza. */
export function StudentForumPage() {
  const { courseId } = useParams();
  const { viewAsStudent } = useAuth();
  const { courses, isLoading: isLoadingCourses } = useCourseTree({ publishedOnly: viewAsStudent });
  const { threads, failed, isLoading } = useForumThreads(courseId);
  const [isCreating, setIsCreating] = useState(false);

  if (isLoadingCourses || isLoading) {
    return (
      <Container className="py-10 md:py-14">
        <p className="text-muted text-[14px]">Cargando foro…</p>
      </Container>
    );
  }

  const course = courses.find((item) => item.id === courseId);
  if (!course) return <Navigate to={ROUTES.studentCourses} replace />;

  return (
    <Container className="py-10 md:py-14">
      <PageTopBar
        backTo={studentCoursePath(course.id)}
        backLabel={`Volver a ${course.title}`}
        crumbs={[
          { label: 'Tus cursos', to: ROUTES.studentCourses },
          { label: course.title, to: studentCoursePath(course.id) },
          { label: 'Foro' },
        ]}
        actions={
          <Button size="sm" variant="primary" onClick={() => setIsCreating(true)}>
            Nuevo hilo
          </Button>
        }
      />

      <h1 className="font-display font-bold text-[clamp(26px,3.6vw,34px)] text-ink text-balance">Foro del curso</h1>
      <p className="text-muted text-[15px] mt-2 mb-8 text-pretty">Pregunta, comparte y responde a los demás alumnos de {course.title}.</p>

      {failed ? (
        <FormAlert variant="error">No pudimos cargar el foro. Intenta de nuevo en un momento.</FormAlert>
      ) : threads.length === 0 ? (
        <div className="border border-dashed border-line-strong rounded-[18px] px-6 py-12 text-center">
          <p className="font-display font-bold text-[20px] text-ink">Todavía no hay hilos</p>
          <p className="text-muted text-[14px] mt-2">Abre el primero con tu pregunta o comentario.</p>
        </div>
      ) : (
        <ul className="bg-panel border border-line rounded-[18px] overflow-hidden">
          {threads.map((thread) => (
            <li key={thread.id} className="border-b border-line last:border-b-0">
              <Link
                to={studentForumThreadPath(course.id, thread.id)}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 sm:px-6 py-4 hover:bg-bg-2/60 transition-colors"
              >
                <span className="min-w-0 flex-1 basis-[280px]">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15.5px] text-ink break-words">{thread.title}</span>
                    {thread.isPinned && <StatusPill tone="success">Fijado</StatusPill>}
                    {thread.isLocked && <StatusPill tone="neutral">Cerrado</StatusPill>}
                  </span>
                  <span className="block text-[12.5px] text-muted mt-1">
                    {thread.authorName}
                    {thread.authorIsAdmin && ' · Admin'} · {formatDateTimeCaracas(thread.createdAt)}
                  </span>
                </span>
                <span className="text-[13px] text-muted whitespace-nowrap">
                  {thread.replyCount === 1 ? '1 respuesta' : `${thread.replyCount} respuestas`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {isCreating && <NewThreadModal courseId={course.id} onClose={() => setIsCreating(false)} />}
    </Container>
  );
}
