// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import authRoutes from './routes/Admin/authRoutes';
import dashboardRoutes from './routes/Admin/dashboardRoutes';
import ErrorPage from './views/error'
import clientauthRoutes from './routes/Client/authRoutes';
import clientdashboardRoutes from './routes/Client/dashboardRoutes';

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
