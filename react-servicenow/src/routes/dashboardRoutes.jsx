// src/routes/dashboardRoutes.jsx
import React from 'react';
import PrivateRoute from '../middleware/PrivateRoute'; // Make sure this exists
import DashboardLayout from '../layout/dashbord';
import DashboardWithCharts from '../views/dashbord';
import Catalog from '../views/dashbord/ProductOfferingCatalog';
import ProductOfferingCatalogFormPage from '../views/dashbord/ProductOfferingCatalog/form'
import POCategory from '../views/dashbord/ProductOfferingCategory';
import ProductOfferingCategoryFormPage from '../views/dashbord/ProductOfferingCategory/form'
import PO from '../views/dashbord/ProductOffering';
import ProductOfferingFormPage from '../views/dashbord/ProductOffering/form'
import PS from '../views/dashbord/ProductSpec';
import ProductSpecificationFormPage from '../views/dashbord/ProductSpec/form'
import AiSearch from '../views/dashbord/ai-search';
import Quote from '../views/dashbord/Quote/index';
import QuoteFormPage from '../views/dashbord/Quote/form'
import Profile from '../views/dashbord/ProfilePage'
import Opportunity from '../views/dashbord/Opportunity/index';
import OpportunityFormPage from '../views/dashbord/Opportunity/form';
import PriceList from '../views/dashbord/PriceList';
import PriceListForm from '../views/dashbord/PriceList/form';
import Account from '../views/dashbord/Account/index';
import AccountForm from '../views/dashbord/Account/form';
import ProductDetails from '../views/dashbord/productdetail';  
import Contact from '../views/dashbord/Contact/index';
import ContactForm from '../views/dashbord/Contact/form';
import LocationForm from '../views/dashbord/Location/form';
import Location from '../views/dashbord/Location/index';
import AdminRoute from '../middleware/AdminRoute';
import ContactRoute from '../middleware/isContactRoute';




const dashboardRoutes = {
  path: '/dashboard',
  element: (
    <PrivateRoute>
      <DashboardLayout />
    </PrivateRoute>
  ),
  children: [
    { index: true, element: <DashboardWithCharts /> },
    // catalog
        { path: 'catalog', element: <Catalog /> },
        {
          path: 'catalog/create',
          element: <ProductOfferingCatalogFormPage />
        },
        {
          path: 'catalog/edit/:id',
          element: <ProductOfferingCatalogFormPage />
        },
        { path: 'category', element: <POCategory /> },
        {
          path: 'category/create',
          element: <ProductOfferingCategoryFormPage />
        },
        {
          path: 'category/edit/:id',
          element: <ProductOfferingCategoryFormPage />
        },
        { path: 'product-offering', element: <PO /> },
        {
          path: 'product-offering/create',
          element: <ProductOfferingFormPage />
        },
        {
          path: 'product-offering/edit/:id',
          element: <ProductOfferingFormPage />
        },
        { path: 'product-specification', element: <PS /> },
        {
          path: 'product-specification/view/:id',
          element: <ProductSpecificationFormPage />
        },
        {
          path: 'opportunity/edit/:id',
          element: <OpportunityFormPage />
        },
        {
          path: 'opportunity/create',
          element: <OpportunityFormPage />
        },
        { path: 'opportunity', element: <Opportunity /> },
        { path: 'price-list', element: <PriceList /> },
        {
          path: 'price-list/edit/:id',
          element: <PriceListForm />
        },
        {
          path: 'price-list/create',
          element: <PriceListForm />
        },
        { path: 'help', element: <AiSearch /> },
        { path: 'quote', element: <Quote /> },
        {
          path: 'quote/edit/:id',
          element: <QuoteFormPage />
        },
        { path: 'profile', element: <Profile /> },

        {path: 'account/view/:id',element: <AccountForm />},
        { path: 'account', element: <Account /> },

        {path: 'contact/view/:id',element: <ContactForm />},
        { path: 'contact', element: <Contact /> },

        {path: 'location/view/:id',element: <LocationForm />},
        { path: 'location', element: <Location /> },
        // ... other dashboard sub-routes
  ],
};

export default dashboardRoutes;
