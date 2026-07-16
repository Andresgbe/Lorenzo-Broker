import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../shared/config/routes';
import { Layout } from './Layout';
import { HomePage } from '../pages/home';
import { AboutPage } from '../pages/about';
import { MentorshipPage } from '../pages/mentorship';

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
    ],
  },
]);
