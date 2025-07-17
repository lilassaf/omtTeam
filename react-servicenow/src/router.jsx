// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import ErrorPage from './views/error'
import clientauthRoutes from './views/Client/routes/authRoutes';
import clientdashboardRoutes from './views/Client/routes/dashboardRoutes';

const router = createBrowserRouter([
  ...authRoutes,
 dashboardRoutes,
  ...clientauthRoutes,
  clientdashboardRoutes,
  {
    path: '*',
    element: <ErrorPage />
  }
]);

export default router;
