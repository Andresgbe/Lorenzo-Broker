export type { Course, CourseModule, Lesson, LessonAttachment } from './model/types';
export {
  formatDuration,
  parseDuration,
  describeModule,
  describeCourse,
  courseLessons,
  courseProgress,
  locateLesson,
  nextPosition,
  formatFileSize,
  type LessonLocation,
} from './model/lib';
export { useCourseTree } from './model/useCourseTree';
export { useLessonProgress } from './model/useLessonProgress';
export {
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderRows,
  setCoursePlans,
  uploadAttachment,
  renameAttachment,
  deleteAttachment,
  getAttachmentUrl,
  type NewCourse,
  type CoursePatch,
  type ModulePatch,
  type LessonPatch,
} from './api/courseApi';
