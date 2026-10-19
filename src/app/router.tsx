import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../shared/config/routes';
import { Layout } from './Layout';
import { HomePage } from '../pages/home';
import { AboutPage } from '../pages/about';
import { MentorshipPage } from '../pages/mentorship';
import { FaqPage } from '../pages/faq';
import { LoginPage } from '../pages/login';
import { RegisterPage } from '../pages/register';
import { SignInPage } from '../pages/sign-in';
import { ForgotPasswordPage } from '../pages/forgot-password';
import { ResetPasswordPage } from '../pages/reset-password';
import { CheckoutPlanPage } from '../pages/checkout-plan';
import { CheckoutSummaryPage } from '../pages/checkout-summary';
import { CheckoutPendingPage } from '../pages/checkout-pending';
import { CheckoutConfirmedPage } from '../pages/checkout-confirmed';
import { StudentNav } from '../widgets/student-nav';
import { StudentHomePage } from '../pages/student-home';
import { StudentCoursesPage } from '../pages/student-courses';
import { StudentCoursePage } from '../pages/student-course';
import { StudentLessonPage } from '../pages/student-lesson';
import { StudentAccountPage } from '../pages/student-account';
import { StudentExpiredPage } from '../pages/student-expired';
import { RequireAdmin } from '../entities/session';
import { AdminShell } from '../widgets/admin-shell';
import { AdminOverviewPage } from '../pages/admin-overview';
import { AdminStudentsPage } from '../pages/admin-students';
import { AdminPaymentsPage } from '../pages/admin-payments';
import { AdminCoursesPage } from '../pages/admin-courses';
import { AdminCoursePage } from '../pages/admin-course';
import { AdminCourseNewPage } from '../pages/admin-course-new';
import { AdminLessonPage } from '../pages/admin-lesson';

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: ROUTES.home, element: <HomePage /> },
        { path: ROUTES.about, element: <AboutPage /> },
        { path: ROUTES.mentorship, element: <MentorshipPage /> },
        { path: ROUTES.faq, element: <FaqPage /> },
        { path: ROUTES.adminLogin, element: <LoginPage /> },
      ],
    },
    // Acceso de alumnos: sin navbar ni footer de marketing.
    { path: ROUTES.register, element: <RegisterPage /> },
    { path: ROUTES.signIn, element: <SignInPage /> },
    { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
    { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },

    // Checkout: también fuera del Layout de marketing, con su propio shell por pasos.
    { path: ROUTES.checkoutPlan, element: <CheckoutPlanPage /> },
    { path: ROUTES.checkoutSummary, element: <CheckoutSummaryPage /> },
    { path: ROUTES.checkoutPending, element: <CheckoutPendingPage /> },
    { path: ROUTES.checkoutConfirmed, element: <CheckoutConfirmedPage /> },

    // Área del alumno: nav propia. Sin proteger todavía — ver CLAUDE.md.
    {
      element: <StudentNav />,
      children: [
        { path: ROUTES.student, element: <StudentHomePage /> },
        { path: ROUTES.studentCourses, element: <StudentCoursesPage /> },
        { path: ROUTES.studentCourse, element: <StudentCoursePage /> },
        { path: ROUTES.studentLesson, element: <StudentLessonPage /> },
        { path: ROUTES.studentAccount, element: <StudentAccountPage /> },
        { path: ROUTES.studentExpired, element: <StudentExpiredPage /> },
      ],
    },

    // Panel de administración: protegido con RequireAdmin, que exige role=admin.
    {
      element: (
        <RequireAdmin>
          <AdminShell />
        </RequireAdmin>
      ),
      children: [
        { path: ROUTES.adminOverview, element: <AdminOverviewPage /> },
        { path: ROUTES.adminStudents, element: <AdminStudentsPage /> },
        { path: ROUTES.adminPayments, element: <AdminPaymentsPage /> },
        { path: ROUTES.adminCourses, element: <AdminCoursesPage /> },
        { path: ROUTES.adminCourseNew, element: <AdminCourseNewPage /> },
        { path: ROUTES.adminCourse, element: <AdminCoursePage /> },
        { path: ROUTES.adminLesson, element: <AdminLessonPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') }
);
