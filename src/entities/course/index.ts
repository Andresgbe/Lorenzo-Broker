export type { Course, CourseLevel, CourseModule, Lesson, LessonAttachment } from './model/types';
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
  groupCoursesByLevel,
  type CourseGroup,
  type LessonLocation,
} from './model/lib';
export { useCourseLevels } from './model/useCourseLevels';
export { useCourseTree } from './model/useCourseTree';
export { useLessonProgress } from './model/useLessonProgress';
export {
  createCourse,
  createCourseLevel,
  updateCourseLevel,
  deleteCourseLevel,
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
