// Producto (plan) → Curso → Módulo → Clase. Todo vive en Supabase y lo crea el
// admin desde /admin/cursos. Un alumno solo recibe lo publicado de los cursos
// que su plan incluye (RLS); el admin recibe todo, borradores incluidos.

export interface LessonAttachment {
  id: string;
  lessonId: string;
  title: string;
  /** Ruta en el bucket privado 'lesson-files'. Se descarga con URL firmada. */
  storagePath: string;
  sizeBytes: number | null;
  position: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  /** ID del video en Bunny Stream. null = clase sin video (solo material). */
  bunnyVideoId: string | null;
  /** Librería de Bunny de este video, si no es la del curso. null = la del curso. */
  bunnyLibraryId: string | null;
  durationSeconds: number | null;
  position: number;
  isPublished: boolean;
  attachments: LessonAttachment[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  isPublished: boolean;
  lessons: Lesson[];
}

export interface CourseLevel {
  id: string;
  title: string;
  position: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  /** ID en Bunny Stream del video de bienvenida, arriba de la página del curso. null = sin video. */
  welcomeVideoId: string | null;
  /** Video Library de Bunny Stream donde están los videos del curso. null = sin configurar: no se reproducen. */
  bunnyLibraryId: string | null;
  /** Nivel al que pertenece. null = sin nivel. */
  levelId: string | null;
  position: number;
  isPublished: boolean;
  /** Planes que incluyen este curso (plan_courses). */
  planIds: string[];
  modules: CourseModule[];
}
