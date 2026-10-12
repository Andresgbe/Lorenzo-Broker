export type LessonKind = 'video' | 'pdf';

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  /** "12:30" para video; null para material descargable. */
  duration: string | null;
  moduleId: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}
