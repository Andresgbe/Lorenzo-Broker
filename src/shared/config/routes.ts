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
  studentModules: '/alumno/modulos',
  studentLesson: '/alumno/clase/:lessonId',
  studentAccount: '/alumno/cuenta',
  studentExpired: '/alumno/membresia-vencida',

  // Acceso de administración, separado del de alumnos a propósito.
  adminLogin: '/admin',
  adminOverview: '/admin/resumen',
  adminStudents: '/admin/alumnos',
  adminPayments: '/admin/pagos',
  adminContent: '/admin/contenido',
} as const;

export function studentLessonPath(lessonId: string) {
  return ROUTES.studentLesson.replace(':lessonId', lessonId);
}

export const HOME_SECTIONS = {
  hero: 'hero',
  includes: 'incluye',
  pricing: 'suscribete',
} as const;
