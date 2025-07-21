// src/routes/dashboardRoutes.jsx
import DashboardLayout from '../../layout/Client/dashbord.jsx';

// Dashboard Pages
import Overview from '../../views/Client/Pages/Dashboard/OverviewPage.jsx';
import SavedItems from '../../views/Client/Pages/Wishlist/SavedItemsPage.jsx';
import MyOrders from '../../views/Client/Pages/MyOrders/CurrentOrdersPage.jsx';
import ProductDetails from '../../views/Client/Pages/Extra/ProductDetails.jsx';
import History from '../../views/Client/Pages/MyOrders/OrderHistoryPage.jsx';
import AllProducts from '../../views/Client/Pages/Shop/AllProducts.jsx';
import OrderTracking  from '../../views/Client/Pages/Shop/OrderTracking.jsx';
import MyProfile  from '../../views/Client/Pages/Extra/MyProfile.jsx';

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

