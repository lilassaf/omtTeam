import React from 'react';
import DashboardLayout from '../../layout/Client/dashbord';

// Middleware
import IsAuth from '../../middleware/client/ProtectedRoute';

// Dashboard Pages
import Dashboard from '../../views/Client/Dashboard/index.jsx';
import Overview from '../../views/Client/Dashboard/OverviewPage.jsx';
import SavedItems from '../../views/Client/Pages/Wishlist/SavedItemsPage.jsx';
import MyOrders from '../../views/Client/Pages/MyOrders/CurrentOrdersPage.jsx';
import ProductDetails from '../../views/Client/Pages/Extra/ProductDetails.jsx';
import History from '../../views/Client/Pages/MyOrders/OrderHistoryPage.jsx';
import AllProducts from '../../views/Client/Pages/Shop/AllProducts.jsx';
import OrderTracking from '../../views/Client/Pages/Shop/OrderTracking.jsx';
import MyProfile from '../../views/Client/Pages/Extra/MyProfile.jsx';
import OrderForm from '../../views/Client/orders/form.jsx';
import Order from '../../views/Client/orders/index.jsx';

const dashboardRoutes = {
  path: '/client',
  element: (
    <IsAuth>
      <DashboardLayout />
    </IsAuth>
  ),
  children: [
    { index: true, element: <Dashboard /> },
    { path: 'overview', element: <Overview /> },
    { path: 'wishlist/saved', element: <SavedItems /> },
    { path: 'orders/current', element: <MyOrders /> },
    { path: 'orders/history', element: <History /> },
    { path: 'ProductDetails/:id', element: <ProductDetails /> },
    { path: 'MyProfile/:id', element: <MyProfile /> },
    { path: 'shop/all-products', element: <AllProducts /> },
    { path: 'shop/order-tracking', element: <OrderTracking /> },

    {path: 'order/view/:id',element: <OrderForm />},
        { path: 'order', element: <Order /> },
  ],
};

export default dashboardRoutes;
