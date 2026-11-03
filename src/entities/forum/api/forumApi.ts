import { supabase } from '../../../shared/lib/supabaseClient';
import type { ForumPost, ForumThread, ThreadPatch } from '../model/types';

const THREAD_COLUMNS =
  'id, course_id, author_id, author_name, author_is_admin, title, body, is_pinned, is_locked, reply_count, last_post_at, edited_at, created_at';
const POST_COLUMNS = 'id, author_id, author_name, author_is_admin, body, edited_at, created_at';

function client() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

function toMessage(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    authorId: row.author_id as string | null,
    authorName: row.author_name as string,
    authorIsAdmin: row.author_is_admin as boolean,
    body: row.body as string,
    createdAt: row.created_at as string,
    editedAt: row.edited_at as string | null,
  };
}

function toThread(row: Record<string, unknown>): ForumThread {
  return {
    ...toMessage(row),
    courseId: row.course_id as string,
    title: row.title as string,
    isPinned: row.is_pinned as boolean,
    isLocked: row.is_locked as boolean,
    replyCount: row.reply_count as number,
    lastPostAt: row.last_post_at as string,
  };
}

/** Los hilos del curso: primero los fijados, luego los de actividad más reciente. */
export async function fetchThreads(courseId: string): Promise<ForumThread[]> {
  const { data, error } = await client()
    .from('forum_threads')
    .select(THREAD_COLUMNS)
    .eq('course_id', courseId)
    .order('is_pinned', { ascending: false })
    .order('last_post_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toThread);
}

/** Un hilo con sus respuestas en orden de llegada. null si no existe o no hay acceso. */
export async function fetchThread(threadId: string): Promise<{ thread: ForumThread; posts: ForumPost[] } | null> {
  const [thread, posts] = await Promise.all([
    client().from('forum_threads').select(THREAD_COLUMNS).eq('id', threadId).maybeSingle(),
    client().from('forum_posts').select(POST_COLUMNS).eq('thread_id', threadId).order('created_at'),
  ]);
  if (thread.error) throw new Error(thread.error.message);
  if (posts.error) throw new Error(posts.error.message);
  if (!thread.data) return null;
  return { thread: toThread(thread.data), posts: (posts.data ?? []).map(toMessage) };
}

export async function createThread(courseId: string, title: string, body: string): Promise<string> {
  const { data, error } = await client().from('forum_threads').insert({ course_id: courseId, title, body }).select('id').single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function updateThread(id: string, patch: ThreadPatch) {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.body !== undefined) row.body = patch.body;
  if (patch.isPinned !== undefined) row.is_pinned = patch.isPinned;
  if (patch.isLocked !== undefined) row.is_locked = patch.isLocked;
  const { error } = await client().from('forum_threads').update(row).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteThread(id: string) {
  const { error } = await client().from('forum_threads').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createPost(threadId: string, body: string) {
  const { error } = await client().from('forum_posts').insert({ thread_id: threadId, body });
  if (error) throw new Error(error.message);
}

export async function updatePost(id: string, body: string) {
  const { error } = await client().from('forum_posts').update({ body }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deletePost(id: string) {
  const { error } = await client().from('forum_posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
