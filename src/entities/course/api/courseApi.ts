import { supabase } from '../../../shared/lib/supabaseClient';
import type { Course, CourseModule, Lesson, LessonAttachment } from '../model/types';

const NOT_CONFIGURED = 'Supabase no está configurado en este entorno.';
const LESSON_FILES_BUCKET = 'lesson-files';

function client() {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

// ------------------------------------------------------------------ lectura

interface AttachmentRow {
  id: string;
  lesson_id: string;
  title: string;
  storage_path: string;
  size_bytes: number | null;
  position: number;
}

interface LessonRow {
  id: string;
  module_id: string;
  title: string;
  description: string;
  bunny_video_id: string | null;
  duration_seconds: number | null;
  position: number;
  is_published: boolean;
  lesson_attachments: AttachmentRow[] | null;
}

interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  position: number;
  is_published: boolean;
  lessons: LessonRow[] | null;
}

interface CourseRow {
  id: string;
  title: string;
  description: string;
  welcome_video_id: string | null;
  position: number;
  is_published: boolean;
  plan_courses: { plan_id: string }[] | null;
  modules: ModuleRow[] | null;
}

const COURSE_TREE_SELECT = `
  id, title, description, welcome_video_id, position, is_published,
  plan_courses ( plan_id ),
  modules (
    id, course_id, title, description, position, is_published,
    lessons (
      id, module_id, title, description, bunny_video_id, duration_seconds, position, is_published,
      lesson_attachments ( id, lesson_id, title, storage_path, size_bytes, position )
    )
  )
`;

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

function toAttachment(row: AttachmentRow): LessonAttachment {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    title: row.title,
    storagePath: row.storage_path,
    sizeBytes: row.size_bytes,
    position: row.position,
  };
}

function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    description: row.description,
    bunnyVideoId: row.bunny_video_id,
    durationSeconds: row.duration_seconds,
    position: row.position,
    isPublished: row.is_published,
    attachments: (row.lesson_attachments ?? []).map(toAttachment).sort(byPosition),
  };
}

function toModule(row: ModuleRow): CourseModule {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    position: row.position,
    isPublished: row.is_published,
    lessons: (row.lessons ?? []).map(toLesson).sort(byPosition),
  };
}

function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    welcomeVideoId: row.welcome_video_id,
    position: row.position,
    isPublished: row.is_published,
    planIds: (row.plan_courses ?? []).map((link) => link.plan_id),
    modules: (row.modules ?? []).map(toModule).sort(byPosition),
  };
}

/** Todos los cursos que el usuario puede ver, con módulos, clases y adjuntos, ya ordenados. */
export async function fetchCourseTree(): Promise<Course[]> {
  const { data, error } = await client().from('courses').select(COURSE_TREE_SELECT).order('position');
  fail(error);
  return ((data ?? []) as unknown as CourseRow[]).map(toCourse);
}

// ------------------------------------------------------------------ escritura (admin; RLS lo exige)

type Table = 'courses' | 'modules' | 'lessons';

export interface CoursePatch {
  title?: string;
  description?: string;
  welcomeVideoId?: string | null;
  isPublished?: boolean;
}

export interface ModulePatch {
  title?: string;
  description?: string;
  isPublished?: boolean;
}

export interface LessonPatch {
  title?: string;
  description?: string;
  bunnyVideoId?: string | null;
  durationSeconds?: number | null;
  isPublished?: boolean;
}

function toColumns(patch: CoursePatch & LessonPatch) {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.isPublished !== undefined) row.is_published = patch.isPublished;
  if (patch.bunnyVideoId !== undefined) row.bunny_video_id = patch.bunnyVideoId;
  if (patch.durationSeconds !== undefined) row.duration_seconds = patch.durationSeconds;
  if (patch.welcomeVideoId !== undefined) row.welcome_video_id = patch.welcomeVideoId;
  return row;
}

async function insertRow(table: Table, row: Record<string, unknown>): Promise<string> {
  const { data, error } = await client().from(table).insert(row).select('id').single();
  fail(error);
  return (data as { id: string }).id;
}

async function updateRow(table: Table, id: string, row: Record<string, unknown>) {
  const { error } = await client().from(table).update(row).eq('id', id);
  fail(error);
}

async function deleteRow(table: Table, id: string) {
  const { error } = await client().from(table).delete().eq('id', id);
  fail(error);
}

export interface NewCourse {
  title: string;
  description: string;
  welcomeVideoId: string | null;
  planIds: string[];
}

export async function createCourse(course: NewCourse, position: number): Promise<string> {
  const id = await insertRow('courses', {
    title: course.title,
    description: course.description,
    welcome_video_id: course.welcomeVideoId,
    position,
  });
  await setCoursePlans(id, course.planIds);
  return id;
}
export const updateCourse = (id: string, patch: CoursePatch) => updateRow('courses', id, toColumns(patch));
export const deleteCourse = (id: string) => deleteRow('courses', id);

// Módulos y clases nacen publicados (decisión del usuario, 22/10/2026): el alumno los ve
// en cuanto el curso está publicado. Para esconder uno, se pasa a borrador con su interruptor.
export const createModule = (courseId: string, title: string, position: number) =>
  insertRow('modules', { course_id: courseId, title, position, is_published: true });
export const updateModule = (id: string, patch: ModulePatch) => updateRow('modules', id, toColumns(patch));
export const deleteModule = (id: string) => deleteRow('modules', id);

export const createLesson = (moduleId: string, title: string, position: number) =>
  insertRow('lessons', { module_id: moduleId, title, position, is_published: true });
export const updateLesson = (id: string, patch: LessonPatch) => updateRow('lessons', id, toColumns(patch));
export const deleteLesson = (id: string) => deleteRow('lessons', id);

/** Guarda el orden de una lista de hermanos después de arrastrar: position = índice. */
export async function reorderRows(table: Table, orderedIds: string[]) {
  await Promise.all(orderedIds.map((id, index) => updateRow(table, id, { position: index })));
}

/** Deja exactamente esos planes asociados al curso. */
export async function setCoursePlans(courseId: string, planIds: string[]) {
  const db = client();
  const { error: deleteError } = await db.from('plan_courses').delete().eq('course_id', courseId);
  fail(deleteError);
  if (planIds.length === 0) return;
  const { error } = await db.from('plan_courses').insert(planIds.map((planId) => ({ plan_id: planId, course_id: courseId })));
  fail(error);
}

// ------------------------------------------------------------------ adjuntos (PDF)

function safeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .slice(-80);
}

export async function uploadAttachment(lessonId: string, file: File, position: number) {
  const db = client();
  const path = `${lessonId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await db.storage
    .from(LESSON_FILES_BUCKET)
    .upload(path, file, { contentType: file.type || 'application/pdf' });
  fail(uploadError);

  const title = file.name.replace(/\.pdf$/i, '');
  const { error } = await db
    .from('lesson_attachments')
    .insert({ lesson_id: lessonId, title, storage_path: path, size_bytes: file.size, position });
  if (error) {
    // Sin fila no hay forma de llegar al archivo: lo quitamos para no dejar basura.
    await db.storage.from(LESSON_FILES_BUCKET).remove([path]);
    throw new Error(error.message);
  }
}

export async function renameAttachment(id: string, title: string) {
  const { error } = await client().from('lesson_attachments').update({ title }).eq('id', id);
  fail(error);
}

export async function deleteAttachment(attachment: LessonAttachment) {
  const db = client();
  const { error } = await db.from('lesson_attachments').delete().eq('id', attachment.id);
  fail(error);
  await db.storage.from(LESSON_FILES_BUCKET).remove([attachment.storagePath]);
}

/** URL de descarga de corta duración. Solo se emite si el usuario tiene acceso (políticas de storage). */
export async function getAttachmentUrl(attachment: LessonAttachment): Promise<string> {
  const { data, error } = await client()
    .storage.from(LESSON_FILES_BUCKET)
    .createSignedUrl(attachment.storagePath, 300, { download: `${safeFileName(attachment.title)}.pdf` });
  fail(error);
  return data!.signedUrl;
}

// ------------------------------------------------------------------ progreso del alumno

export async function fetchCompletedLessonIds(): Promise<Set<string>> {
  const { data, error } = await client().from('lesson_progress').select('lesson_id');
  fail(error);
  return new Set((data ?? []).map((row) => (row as { lesson_id: string }).lesson_id));
}

export async function setLessonCompleted(lessonId: string, completed: boolean) {
  const db = client();
  if (completed) {
    // ON CONFLICT DO NOTHING: marcarla dos veces no es un error (y no hay política de UPDATE).
    const { error } = await db
      .from('lesson_progress')
      .upsert({ lesson_id: lessonId }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true });
    fail(error);
  } else {
    const { error } = await db.from('lesson_progress').delete().eq('lesson_id', lessonId);
    fail(error);
  }
}
