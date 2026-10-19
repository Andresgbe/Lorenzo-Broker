import { useRef, useState, type ChangeEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  deleteAttachment,
  deleteLesson,
  formatDuration,
  formatFileSize,
  getAttachmentUrl,
  locateLesson,
  nextPosition,
  parseDuration,
  renameAttachment,
  updateLesson,
  uploadAttachment,
  useCourseTree,
  type Lesson,
  type LessonAttachment,
} from '../../entities/course';
import { CheckIcon, DeleteButton, EyeIcon, useAdminAction } from '../../features/manage-courses';
import { AdminTopBar } from '../../widgets/admin-shell';
import { ROUTES, adminCoursePath, adminLessonPath, studentLessonPath } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { FormAlert } from '../../shared/ui/FormAlert';
import { MenuButton } from '../../shared/ui/MenuButton';
import { Switch } from '../../shared/ui/Switch';
import { TextField, inputClasses } from '../../shared/ui/TextField';

const sectionLabel = 'text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent';
const MAX_PDF_BYTES = 50 * 1024 * 1024;

// ---------------------------------------------------------------- datos de la clase

interface LessonFormProps {
  lesson: Lesson;
  onSaved: () => Promise<void>;
}

function LessonForm({ lesson, onSaved }: LessonFormProps) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [videoId, setVideoId] = useState(lesson.bunnyVideoId ?? '');
  const [duration, setDuration] = useState(formatDuration(lesson.durationSeconds) ?? '');
  const [isPublished, setIsPublished] = useState(lesson.isPublished);
  const [errors, setErrors] = useState<{ title?: string; duration?: string }>({});
  const [saved, setSaved] = useState(false);
  const { run, isBusy, error } = useAdminAction();

  function touch() {
    setSaved(false);
  }

  async function handleSave() {
    const durationSeconds = parseDuration(duration);
    const nextErrors = {
      title: title.trim() ? undefined : 'La clase necesita un título.',
      duration: durationSeconds === undefined ? 'Usa minutos:segundos, por ejemplo 12:30.' : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.duration) return;

    const ok = await run(() =>
      updateLesson(lesson.id, {
        title: title.trim(),
        description: description.trim(),
        bunnyVideoId: videoId.trim() || null,
        durationSeconds: durationSeconds ?? null,
        isPublished,
      })
    );
    if (ok) {
      setSaved(true);
      await onSaved();
    }
  }

  return (
    <section className="bg-panel border border-line rounded-[18px] p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className={sectionLabel}>Datos de la clase</h2>
        <Switch
          checked={isPublished}
          onChange={(checked) => {
            setIsPublished(checked);
            touch();
          }}
          label="Publicar esta clase"
        />
      </div>

      <div className="flex flex-col gap-5">
        <TextField
          label="Título"
          value={title}
          error={errors.title}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
            touch();
          }}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lesson-description" className="text-[13px] text-[#c6cedb]">
            Descripción
          </label>
          <textarea
            id="lesson-description"
            rows={5}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              touch();
            }}
            placeholder="Qué aprende el alumno en esta clase…"
            className={cn(inputClasses, 'resize-y')}
          />
        </div>
 
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <TextField 
            label="ID del video en Bunny Stream"
            value={videoId}
            placeholder="p. ej. 3f2a9c1e-…"
            hint="."
            onChange={(event) => {
              setVideoId(event.target.value);
              touch();
            }}
          />
          <TextField
            label="Duración"
            value={duration}
            placeholder="12:30"
            error={errors.duration}
            onChange={(event) => {
              setDuration(event.target.value);
              setErrors((prev) => ({ ...prev, duration: undefined }));
              touch();
            }}
          />
        </div>

        <p className="text-[12px] text-muted">
          {isPublished
            ? 'Publicada: los alumnos con acceso la ven si su módulo y su curso también están publicados.'
            : 'Borrador: solo la ven los administradores.'}
        </p>

        {error && <FormAlert variant="error">{error}</FormAlert>}
        {saved && !error && <FormAlert variant="success">Cambios guardados.</FormAlert>}

        <div className="pt-5 border-t border-line">
          <Button variant="primary" size="sm" onClick={() => void handleSave()} disabled={isBusy}>
            <CheckIcon className="w-4 h-4" />
            {isBusy ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- material en PDF

function AttachmentRow({ attachment, onChanged }: { attachment: LessonAttachment; onChanged: () => Promise<void> }) {
  const [title, setTitle] = useState(attachment.title);
  const { run, isBusy, error } = useAdminAction();

  async function handleOpen() {
    await run(async () => {
      window.open(await getAttachmentUrl(attachment), '_blank', 'noopener');
    });
  }

  return (
    <li className="flex flex-col gap-2 px-5 py-3 border-b border-line last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <input
          aria-label="Nombre del archivo"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            if (!title.trim()) setTitle(attachment.title);
            else if (title.trim() !== attachment.title)
              void run(() => renameAttachment(attachment.id, title.trim())).then((ok) => (ok ? onChanged() : undefined));
          }}
          className="flex-1 min-w-[160px] bg-transparent outline-none border-b border-dashed border-transparent hover:border-line focus:border-accent text-[14px] text-ink py-1 transition-colors"
        />
        <span className="text-[12px] text-muted">{formatFileSize(attachment.sizeBytes)}</span>
        <button type="button" onClick={() => void handleOpen()} disabled={isBusy} className="text-[13px] font-semibold text-accent hover:underline cursor-pointer">
          Ver
        </button>
        <DeleteButton
          title={`¿Eliminar “${attachment.title}”?`}
          description="Los alumnos dejan de poder descargarlo. No se puede deshacer."
          confirmLabel="Eliminar PDF"
          onConfirm={() => run(() => deleteAttachment(attachment)).then((ok) => (ok ? onChanged() : undefined))}
          disabled={isBusy}
        />
      </div>
      {error && <FormAlert variant="error">{error}</FormAlert>}
    </li>
  );
}

function AttachmentsSection({ lesson, onChanged }: { lesson: Lesson; onChanged: () => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { run, isBusy, error } = useAdminAction();

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    setUploadError(null);
    const invalid = files.find((file) => file.type !== 'application/pdf' || file.size > MAX_PDF_BYTES);
    if (invalid) {
      setUploadError(`“${invalid.name}” no se subió: solo PDF de hasta 50 MB.`);
      return;
    }
    const ok = await run(async () => {
      let position = nextPosition(lesson.attachments);
      for (const file of files) await uploadAttachment(lesson.id, file, position++);
    });
    if (ok) await onChanged();
  }

  return (
    <section className="bg-panel border border-line rounded-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
        <h2 className={sectionLabel}>Material en PDF</h2>
        <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} disabled={isBusy}>
          {isBusy ? 'Subiendo…' : '+ Subir PDF'}
        </Button>
        <input ref={inputRef} type="file" accept="application/pdf" multiple hidden onChange={(event) => void handleFiles(event)} />
      </div>

      {(uploadError || error) && (
        <div className="px-5 pt-4">
          <FormAlert variant="error">{uploadError ?? error}</FormAlert>
        </div>
      )}

      {lesson.attachments.length === 0 ? (
        <p className="px-5 py-5 text-[13px] text-muted">Sin material. Los PDF que subas los descarga el alumno desde la clase.</p>
      ) : (
        <ul>
          {lesson.attachments.map((attachment) => (
            <AttachmentRow key={attachment.id} attachment={attachment} onChanged={onChanged} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- página

export function AdminLessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { courses, isLoading, error, reload } = useCourseTree();
  const { run, isBusy, error: actionError } = useAdminAction();
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return <p className="text-muted text-[14px]">Cargando clase…</p>;
  if (error) return <FormAlert variant="error">{error}</FormAlert>;

  const location = locateLesson(courses, lessonId);
  if (!location || location.course.id !== courseId) {
    return <Navigate to={courseId ? adminCoursePath(courseId) : ROUTES.adminCourses} replace />;
  }
  const { course, module, lesson, previous, next } = location;

  async function handleDelete() {
    const ok = await run(async () => {
      for (const attachment of lesson.attachments) await deleteAttachment(attachment);
      await deleteLesson(lesson.id);
    });
    setIsDeleting(false);
    if (ok) navigate(adminCoursePath(course.id));
  }

  return (
    <div className="max-w-6xl">
      <AdminTopBar
        backTo={adminCoursePath(course.id)}
        backLabel={`Volver a ${course.title}`}
        crumbs={[
          { label: 'Cursos', to: ROUTES.adminCourses },
          { label: course.title, to: adminCoursePath(course.id) },
          { label: module.title, to: adminCoursePath(course.id) },
          { label: lesson.title },
        ]}
        actions={
          <>
            <Button to={studentLessonPath(lesson.id)} variant="ghost" size="sm">
              <EyeIcon className="w-4 h-4" />
              Vista previa
            </Button>
            <MenuButton
              label="Más acciones de la clase"
              items={[{ label: 'Eliminar clase', tone: 'danger', onSelect: () => setIsDeleting(true) }]}
            />
          </>
        }
      />

      <h1 className="font-display font-bold text-[clamp(26px,3.4vw,34px)] text-ink text-balance mb-6">{lesson.title}</h1>

      {actionError && (
        <div className="mb-4">
          <FormAlert variant="error">{actionError}</FormAlert>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_400px] items-start">
        <LessonForm
          key={`${lesson.id}-${lesson.title}-${lesson.isPublished}-${lesson.bunnyVideoId}-${lesson.durationSeconds}`}
          lesson={lesson}
          onSaved={reload}
        />
        <AttachmentsSection lesson={lesson} onChanged={reload} />
      </div>

      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-line">
        {previous ? (
          <Link to={adminLessonPath(course.id, previous.id)} className="text-[13.5px] text-muted hover:text-accent transition-colors">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={adminLessonPath(course.id, next.id)} className="text-[13.5px] text-accent hover:underline">
            {next.title} →
          </Link>
        )}
      </div>

      <ConfirmDialog
        open={isDeleting}
        title={`¿Eliminar “${lesson.title}”?`}
        description={`Se borra la clase${lesson.attachments.length > 0 ? ` y sus ${lesson.attachments.length} PDF` : ''}. Los alumnos dejan de verla. No se puede deshacer.`}
        confirmLabel="Eliminar clase"
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsDeleting(false)}
        isBusy={isBusy}
      />
    </div>
  );
}
