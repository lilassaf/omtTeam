// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import authRoutes from './routes/Admin/authRoutes';
import dashboardRoutes from './routes/Admin/dashboardRoutes';
import ErrorPage from './views/error'
import Error403 from './views/error/403'
import clientauthRoutes from './routes/Client/authRoutes';
import clientdashboardRoutes from './routes/Client/dashboardRoutes';
import Home from './views/auth/Home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  ...authRoutes,
 dashboardRoutes,
  ...clientauthRoutes,
  clientdashboardRoutes,
  {
    path: '*',
    element: <ErrorPage />
  },
  {
    path:'/403',
    element: <Error403 />
  }
]);

export default router;
