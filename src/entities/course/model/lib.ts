import type { Course, CourseModule, Lesson } from './types';

/** 750 → "12:30"; 3725 → "1:02:05". */
export function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** "12:30" o "1:02:05" → segundos. Vacío → null. Formato inválido → undefined. */
export function parseDuration(text: string): number | null | undefined {
  const value = text.trim();
  if (!value) return null;
  if (!/^\d{1,3}(:[0-5]\d){1,2}$/.test(value)) return undefined;
  const seconds = value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  return seconds > 0 ? seconds : null;
}

export function countModuleContent(module: CourseModule) {
  const lessons = module.lessons.length;
  const pdfs = module.lessons.reduce((total, lesson) => total + lesson.attachments.length, 0);
  return { lessons, pdfs };
}

export function describeModule(module: CourseModule) {
  const { lessons, pdfs } = countModuleContent(module);
  const parts = [`${lessons} ${lessons === 1 ? 'clase' : 'clases'}`];
  if (pdfs > 0) parts.push(`${pdfs} PDF`);
  return parts.join(' · ');
}

export function courseLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function describeCourse(course: Course) {
  const lessons = courseLessons(course).length;
  const modules = course.modules.length;
  return `${modules} ${modules === 1 ? 'módulo' : 'módulos'} · ${lessons} ${lessons === 1 ? 'clase' : 'clases'}`;
}

/** Porcentaje entero de clases completadas del curso. */
export function courseProgress(course: Course, completed: Set<string>) {
  const lessons = courseLessons(course);
  if (lessons.length === 0) return 0;
  const done = lessons.filter((lesson) => completed.has(lesson.id)).length;
  return Math.round((done / lessons.length) * 100);
}

export interface LessonLocation {
  course: Course;
  module: CourseModule;
  lesson: Lesson;
  previous: Lesson | null;
  next: Lesson | null;
}

/** Encuentra una clase y sus vecinas dentro del curso (cruzando módulos). */
export function locateLesson(courses: Course[], lessonId: string | undefined): LessonLocation | null {
  if (!lessonId) return null;
  for (const course of courses) {
    const lessons = courseLessons(course);
    const index = lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index === -1) continue;
    const lesson = lessons[index];
    const module = course.modules.find((item) => item.id === lesson.moduleId)!;
    return {
      course,
      module,
      lesson,
      previous: index > 0 ? lessons[index - 1] : null,
      next: index < lessons.length - 1 ? lessons[index + 1] : null,
    };
  }
  return null;
}

/** Siguiente posición libre al final de una lista de hermanos. */
export function nextPosition(items: { position: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.position), -1) + 1;
}

export function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
