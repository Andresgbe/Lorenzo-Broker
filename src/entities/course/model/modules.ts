import type { CourseModule, Lesson } from './types';

/**
 * Contenido de ejemplo para montar las pantallas. NO es el temario real:
 * reemplazar por datos de Supabase cuando existan las tablas de módulos y clases.
 */
export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos del mercado',
    preview: true,
    lessons: [
      { id: 'que-es-la-bolsa', title: 'Qué es la bolsa y quién participa', kind: 'video', duration: '14:02', moduleId: 'fundamentos' },
      { id: 'tipos-de-orden', title: 'Tipos de orden y cómo se ejecutan', kind: 'video', duration: '11:45', moduleId: 'fundamentos' },
      { id: 'glosario', title: 'Glosario del trader', kind: 'pdf', duration: null, moduleId: 'fundamentos' },
    ],
  },
  {
    id: 'analisis-tecnico',
    title: 'Análisis técnico',
    lessons: [
      { id: 'velas-japonesas', title: 'Lectura de velas japonesas', kind: 'video', duration: '12:30', moduleId: 'analisis-tecnico' },
      { id: 'soportes-resistencias', title: 'Soportes y resistencias en gráfico diario', kind: 'video', duration: '18:20', moduleId: 'analisis-tecnico' },
      { id: 'medias-moviles', title: 'Medias móviles', kind: 'video', duration: '15:08', moduleId: 'analisis-tecnico' },
      { id: 'guia-patrones', title: 'Guía de patrones de vela', kind: 'pdf', duration: null, moduleId: 'analisis-tecnico' },
    ],
  },
  {
    id: 'gestion-riesgo',
    title: 'Gestión de riesgo',
    lessons: [
      { id: 'tamano-posicion', title: 'Cómo calcular el tamaño de la posición', kind: 'video', duration: '16:40', moduleId: 'gestion-riesgo' },
      { id: 'stop-loss', title: 'Dónde poner el stop y por qué', kind: 'video', duration: '13:12', moduleId: 'gestion-riesgo' },
    ],
  },
  {
    id: 'psicologia',
    title: 'Psicología del trading',
    lessons: [
      { id: 'operar-sin-corazonadas', title: 'Operar con estadística, no con corazonadas', kind: 'video', duration: '19:55', moduleId: 'psicologia' },
      { id: 'racha-perdedora', title: 'Qué hacer en una racha perdedora', kind: 'video', duration: '17:30', moduleId: 'psicologia' },
    ],
  },
  {
    id: 'operativa-en-vivo',
    title: 'Operativa en vivo (grabaciones)',
    lessons: [
      { id: 'sesion-apertura', title: 'Sesión de apertura comentada', kind: 'video', duration: '42:10', moduleId: 'operativa-en-vivo' },
      { id: 'sesion-swing', title: 'Revisión swing de la semana', kind: 'video', duration: '35:25', moduleId: 'operativa-en-vivo' },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = COURSE_MODULES.flatMap((module) => module.lessons);

export function findLesson(lessonId: string | undefined): Lesson | null {
  return ALL_LESSONS.find((lesson) => lesson.id === lessonId) ?? null;
}

export function findModule(moduleId: string): CourseModule | null {
  return COURSE_MODULES.find((module) => module.id === moduleId) ?? null;
}

export function countLessons(module: CourseModule) {
  const videos = module.lessons.filter((lesson) => lesson.kind === 'video').length;
  const pdfs = module.lessons.filter((lesson) => lesson.kind === 'pdf').length;
  return { videos, pdfs };
}

export function describeModule(module: CourseModule) {
  const { videos, pdfs } = countLessons(module);
  const parts = [`${videos} ${videos === 1 ? 'clase' : 'clases'}`];
  if (pdfs > 0) parts.push(`${pdfs} PDF`);
  return parts.join(' · ');
}

/** Clases adyacentes dentro del mismo módulo, para los botones anterior/siguiente. */
export function lessonNeighbours(lesson: Lesson) {
  const module = findModule(lesson.moduleId);
  if (!module) return { previous: null, next: null };
  const index = module.lessons.findIndex((item) => item.id === lesson.id);
  return {
    previous: index > 0 ? module.lessons[index - 1] : null,
    next: index < module.lessons.length - 1 ? module.lessons[index + 1] : null,
  };
}
