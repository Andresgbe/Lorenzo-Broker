import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createPost,
  deletePost,
  deleteThread,
  updatePost,
  updateThread,
  useForumAction,
  useForumThread,
  type ForumPost,
} from '../../entities/forum';
import { formatDateTimeCaracas } from '../../entities/payment';
import { useAuth } from '../../entities/session';
import { ROUTES, studentCourseForumPath } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Button } from '../../shared/ui/Button';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { Container } from '../../shared/ui/Container';
import { FormAlert } from '../../shared/ui/FormAlert';
import { MenuButton, type MenuItem } from '../../shared/ui/MenuButton';
import { PageTopBar } from '../../shared/ui/PageTopBar';
import { StatusPill } from '../../shared/ui/StatusPill';
import { inputClasses } from '../../shared/ui/TextField';

const BODY_MAX = 5000;

function Byline({ name, isAdmin, createdAt, editedAt }: { name: string; isAdmin: boolean; createdAt: string; editedAt: string | null }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
      <span className="text-ink-soft font-semibold">{name}</span>
      {isAdmin && <StatusPill tone="success">Admin</StatusPill>}
      <span>{formatDateTimeCaracas(createdAt)}</span>
      {editedAt && <span>· editado</span>}
    </p>
  );
}

function BodyEditor({ value, onChange, label, rows = 4 }: { value: string; onChange: (value: string) => void; label: string; rows?: number }) {
  return (
    <textarea
      aria-label={label}
      rows={rows}
      maxLength={BODY_MAX}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(inputClasses, 'resize-y')}
    />
  );
}

function EditActions({ isBusy, onCancel, onSave }: { isBusy: boolean; onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 mt-3">
      <Button size="sm" variant="ghost" onClick={onCancel} disabled={isBusy}>
        Cancelar
      </Button>
      <Button size="sm" variant="primary" onClick={onSave} disabled={isBusy}>
        {isBusy ? 'Guardando…' : 'Guardar'}
      </Button>
    </div>
  );
}

function MessageCard({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="relative bg-panel border border-line rounded-[18px] p-5 sm:p-6">
      {action && <div className="absolute top-4 right-4">{action}</div>}
      {children}
    </div>
  );
}

function PostCard({ post, canEdit, isLocked, onChanged }: { post: ForumPost; canEdit: boolean; isLocked: boolean; onChanged: () => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { run, isBusy, error } = useForumAction();

  async function save() {
    if (!draft?.trim()) return;
    if (await run(() => updatePost(post.id, draft.trim()))) {
      setDraft(null);
      onChanged();
    }
  }

  async function remove() {
    const ok = await run(() => deletePost(post.id));
    setIsDeleting(false);
    if (ok) onChanged();
  }

  const items: MenuItem[] = [
    ...(isLocked ? [] : [{ label: 'Editar', onSelect: () => setDraft(post.body) }]),
    { label: 'Eliminar', tone: 'danger', onSelect: () => setIsDeleting(true) },
  ];

  return (
    <MessageCard action={canEdit && draft === null ? <MenuButton label={`Acciones de la respuesta de ${post.authorName}`} items={items} /> : undefined}>
      <div className="pr-12">
        <Byline name={post.authorName} isAdmin={post.authorIsAdmin} createdAt={post.createdAt} editedAt={post.editedAt} />
      </div>
      {draft === null ? (
        <p className="text-[15px] text-ink-soft leading-relaxed mt-3 whitespace-pre-line break-words">{post.body}</p>
      ) : (
        <div className="mt-3">
          <BodyEditor label="Editar respuesta" value={draft} onChange={setDraft} />
          <EditActions isBusy={isBusy} onCancel={() => setDraft(null)} onSave={() => void save()} />
        </div>
      )}
      {error && (
        <div className="mt-3">
          <FormAlert variant="error">{error}</FormAlert>
        </div>
      )}
      <ConfirmDialog
        open={isDeleting}
        title="¿Eliminar esta respuesta?"
        description="Desaparece del hilo para todos. No se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => void remove()}
        onCancel={() => setIsDeleting(false)}
        isBusy={isBusy}
      />
    </MessageCard>
  );
}

/** Un hilo del foro: el mensaje inicial y sus respuestas. Un admin puede editar, fijar, cerrar o borrar. */
export function StudentForumThreadPage() {
  const { courseId, threadId } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { thread, posts, failed, isLoading, reload } = useForumThread(threadId);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState<string>();
  const [draft, setDraft] = useState<{ title: string; body: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { run, isBusy, error } = useForumAction();

  const forumPath = courseId ? studentCourseForumPath(courseId) : ROUTES.studentCourses;

  if (isLoading) {
    return (
      <Container className="py-10 md:py-14">
        <p className="text-muted text-[14px]">Cargando hilo…</p>
      </Container>
    );
  }

  const topBar = (label: string, actions?: ReactNode) => (
    <PageTopBar
      backTo={forumPath}
      backLabel="Volver al foro"
      crumbs={[{ label: 'Foro', to: forumPath }, { label }]}
      actions={actions}
    />
  );

  if (!thread) {
    return (
      <Container className="py-10 md:py-14">
        {topBar('Hilo')}
        {failed ? (
          <FormAlert variant="error">No pudimos cargar el hilo. Intenta de nuevo en un momento.</FormAlert>
        ) : (
          <div className="bg-panel border border-line rounded-[18px] p-8 text-center">
            <p className="text-[15px] text-ink">No encontramos este hilo.</p>
            <p className="text-[13.5px] text-muted mt-1.5">Puede que lo hayan eliminado. Vuelve al foro del curso.</p>
          </div>
        )}
      </Container>
    );
  }

  const currentThread = thread;
  const isAuthor = user?.id === thread.authorId;
  const canWrite = isAdmin || !thread.isLocked;

  async function handleReply(event: FormEvent) {
    event.preventDefault();
    if (!reply.trim()) {
      setReplyError('Escribe tu respuesta.');
      return;
    }
    if (await run(() => createPost(currentThread.id, reply.trim()))) {
      setReply('');
      reload();
    }
  }

  async function saveThread() {
    if (!draft || draft.title.trim().length < 3 || !draft.body.trim()) return;
    if (await run(() => updateThread(currentThread.id, { title: draft.title.trim(), body: draft.body.trim() }))) {
      setDraft(null);
      reload();
    }
  }

  async function changeThread(patch: { isPinned?: boolean; isLocked?: boolean }) {
    if (await run(() => updateThread(currentThread.id, patch))) reload();
  }

  async function removeThread() {
    const ok = await run(() => deleteThread(currentThread.id));
    setIsDeleting(false);
    if (ok) navigate(forumPath);
  }

  const threadItems: MenuItem[] = [];
  if (isAdmin || (isAuthor && !thread.isLocked)) {
    threadItems.push({ label: 'Editar', onSelect: () => setDraft({ title: currentThread.title, body: currentThread.body }) });
  }
  if (isAdmin) {
    threadItems.push(
      { label: thread.isPinned ? 'Quitar de fijados' : 'Fijar arriba', onSelect: () => void changeThread({ isPinned: !currentThread.isPinned }) },
      { label: thread.isLocked ? 'Reabrir hilo' : 'Cerrar hilo', onSelect: () => void changeThread({ isLocked: !currentThread.isLocked }) }
    );
  }
  // Su autor solo puede borrarlo mientras nadie haya respondido.
  if (isAdmin || (isAuthor && thread.replyCount === 0)) {
    threadItems.push({ label: 'Eliminar hilo', tone: 'danger', onSelect: () => setIsDeleting(true) });
  }

  return (
    <Container className="py-10 md:py-14 max-w-4xl xl:max-w-4xl">
      {topBar(thread.title, threadItems.length > 0 ? <MenuButton label="Acciones del hilo" items={threadItems} /> : undefined)}

      {error && (
        <div className="mb-4">
          <FormAlert variant="error">{error}</FormAlert>
        </div>
      )}

      {draft ? (
        <MessageCard>
          <input
            aria-label="Título del hilo"
            maxLength={160}
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            className={cn(inputClasses, 'mb-3')}
          />
          <BodyEditor label="Mensaje del hilo" rows={6} value={draft.body} onChange={(body) => setDraft({ ...draft, body })} />
          <EditActions isBusy={isBusy} onCancel={() => setDraft(null)} onSave={() => void saveThread()} />
        </MessageCard>
      ) : (
        <MessageCard>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h1 className="font-display font-bold text-[clamp(22px,3vw,28px)] text-ink text-balance break-words">{thread.title}</h1>
            {thread.isPinned && <StatusPill tone="success">Fijado</StatusPill>}
            {thread.isLocked && <StatusPill tone="neutral">Cerrado</StatusPill>}
          </div>
          <Byline name={thread.authorName} isAdmin={thread.authorIsAdmin} createdAt={thread.createdAt} editedAt={thread.editedAt} />
          <p className="text-[15px] text-ink-soft leading-relaxed mt-4 whitespace-pre-line break-words">{thread.body}</p>
        </MessageCard>
      )}

      <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mt-9 mb-4">
        {posts.length === 1 ? '1 respuesta' : `${posts.length} respuestas`}
      </h2>

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canEdit={isAdmin || user?.id === post.authorId}
            isLocked={!isAdmin && thread.isLocked}
            onChanged={reload}
          />
        ))}
      </div>

      {canWrite ? (
        <form noValidate onSubmit={(event) => void handleReply(event)} className="mt-6">
          <BodyEditor
            label="Tu respuesta"
            value={reply}
            onChange={(value) => {
              setReply(value);
              setReplyError(undefined);
            }}
          />
          {replyError && <p className="text-[12.5px] text-red-400 mt-1.5">{replyError}</p>}
          <div className="flex justify-end mt-3">
            <Button type="submit" size="sm" variant="primary" disabled={isBusy}>
              {isBusy ? 'Publicando…' : 'Responder'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-6 text-[13.5px] text-muted text-center">Este hilo está cerrado: ya no admite respuestas.</p>
      )}

      <ConfirmDialog
        open={isDeleting}
        title="¿Eliminar este hilo?"
        description={`Se borran el mensaje y sus ${thread.replyCount} respuestas. No se puede deshacer.`}
        confirmLabel="Eliminar hilo"
        onConfirm={() => void removeThread()}
        onCancel={() => setIsDeleting(false)}
        isBusy={isBusy}
      />
    </Container>
  );
}
