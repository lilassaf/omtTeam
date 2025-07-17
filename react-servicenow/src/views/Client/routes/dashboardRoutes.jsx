// src/routes/dashboardRoutes.jsx
import DashboardLayout from '../layout/dashbord.jsx';

// Dashboard Pages
import Overview from '../Pages/Dashboard/OverviewPage.jsx';
import SavedItems from '../Pages/Wishlist/SavedItemsPage.jsx';
import MyOrders from '../Pages/MyOrders/CurrentOrdersPage.jsx';
import ProductDetails from '../Pages/Extra/ProductDetails.jsx';
import History from '../Pages/MyOrders/OrderHistoryPage.jsx';
import AllProducts from '../Pages/Shop/AllProducts.jsx';
import OrderTracking  from '../Pages/Shop/OrderTracking.jsx';
import MyProfile  from '../Pages/Extra/MyProfile.jsx';

const dashboardRoutes = {
  path: '/client',
  element: <DashboardLayout />, 
  children: [
    { index: true, element: <Overview /> },
    { path: 'overview', element: <Overview /> },
    { path: 'wishlist/saved', element: <SavedItems /> },
    { path: 'orders/current', element: <MyOrders /> },
    { path: 'orders/history', element: <History /> },
    { path: 'ProductDetails/:id', element: <ProductDetails /> },
    { path: 'MyProfile/:id', element: <MyProfile /> },
    { path: 'shop/all-products', element: <AllProducts /> },
    { path: 'shop/order-tracking', element: <OrderTracking /> },

  ],
};

export default dashboardRoutes;

