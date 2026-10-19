export const ROUTES = {
  home: '/',
  about: '/about',
  mentorship: '/mentorship',
  faq: '/faq',

  // Acceso de alumnos.
  register: '/registro',
  signIn: '/iniciar-sesion',
  forgotPassword: '/recuperar-contrasena',
  resetPassword: '/nueva-contrasena',

  // Checkout. El plan elegido viaja en ?plan= para que sobreviva a un refresh.
  checkoutPlan: '/suscripcion',
  checkoutSummary: '/suscripcion/resumen',
  checkoutPending: '/suscripcion/verificando',
  checkoutConfirmed: '/suscripcion/confirmado',

  // Área del alumno.
  student: '/alumno',
  studentCourses: '/alumno/cursos',
  studentCourse: '/alumno/cursos/:courseId',
  studentLesson: '/alumno/clase/:lessonId',
  studentAccount: '/alumno/cuenta',
  studentExpired: '/alumno/membresia-vencida',

  // Acceso de administración, separado del de alumnos a propósito.
  adminLogin: '/admin',
  adminOverview: '/admin/resumen',
  adminStudents: '/admin/alumnos',
  adminPayments: '/admin/pagos',
  // Módulo de cursos: el admin edita cursos, módulos y clases fuera de la vista del alumno.
  adminCourses: '/admin/cursos',
  adminCourseNew: '/admin/cursos/nuevo',
  adminCourse: '/admin/cursos/:courseId',
  adminLesson: '/admin/cursos/:courseId/clases/:lessonId',
} as const;

export function studentLessonPath(lessonId: string) {
  return ROUTES.studentLesson.replace(':lessonId', lessonId);
}

export function studentCoursePath(courseId: string) {
  return ROUTES.studentCourse.replace(':courseId', courseId);
}

export function adminCoursePath(courseId: string) {
  return ROUTES.adminCourse.replace(':courseId', courseId);
}

export function adminLessonPath(courseId: string, lessonId: string) {
  return ROUTES.adminLesson.replace(':courseId', courseId).replace(':lessonId', lessonId);
}

export const HOME_SECTIONS = {
  hero: 'hero',
  includes: 'incluye',
  pricing: 'suscribete',
} as const;
