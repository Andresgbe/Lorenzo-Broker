import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../shared/config/routes';
import { Layout } from './Layout';
import { HomePage } from '../pages/home';
import { AboutPage } from '../pages/about';
import { MentorshipPage } from '../pages/mentorship';
import { CommunityPage } from '../pages/community';
import { FaqPage } from '../pages/faq';
import { LoginPage } from '../pages/login';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: ROUTES.home,
        element: <HomePage />,
      },
      {
        path: ROUTES.about,
        element: <AboutPage />,
      },
      {
        path: ROUTES.mentorship,
        element: <MentorshipPage />,
      },
      {
        path: ROUTES.community,
        element: <CommunityPage />,
      },
      {
        path: ROUTES.faq,
        element: <FaqPage />,
      },
      {
        path: ROUTES.login,
        element: <LoginPage />,
      },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') });
