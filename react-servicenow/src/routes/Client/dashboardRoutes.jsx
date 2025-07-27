import React from 'react';
import DashboardLayout from '../../layout/Client/dashbord';

// Middleware
import IsAuth from '../../middleware/client/ProtectedRoute';

// Dashboard Pages
import Dashboard from '../../views/Client/Dashboard/index.jsx';
import Quote from '../../views/Client/Quote/index.jsx'


const dashboardRoutes = {
  path: '/client',
  element: (
    <IsAuth>
      <DashboardLayout />
    </IsAuth>
  ),
  children: [
    { index: true, element: <Dashboard /> },
    {path: 'order/view/:id',element: <OrderForm />},
        { path: 'order', element: <Order /> },
    { path: 'quote', element: <Quote /> },
  ],
};

export default dashboardRoutes;
