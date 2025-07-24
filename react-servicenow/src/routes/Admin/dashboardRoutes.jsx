// src/routes/dashboardRoutes.jsx
import React from 'react';
import PrivateRoute from '../../middleware/PrivateRoute'; // Make sure this exists
import DashboardLayout from '../../layout/Admin/dashbord';
import DashboardWithCharts from '../../views/Admin';
import Catalog from '../../views/Admin/ProductOfferingCatalog';
import ProductOfferingCatalogFormPage from '../../views/Admin/ProductOfferingCatalog/form'
import POCategory from '../../views/Admin/ProductOfferingCategory';
import ProductOfferingCategoryFormPage from '../../views/Admin/ProductOfferingCategory/form'
import PO from '../../views/Admin/ProductOffering';
import ProductOfferingFormPage from '../../views/Admin/ProductOffering/form'
import PS from '../../views/Admin/ProductSpec';
import ProductSpecificationFormPage from '../../views/Admin/ProductSpec/form'
import AiSearch from '../../views/Admin/ai-search';
import Quote from '../../views/Admin/Quote/index';
import QuoteFormPage from '../../views/Admin/Quote/form'
import Profile from '../../views/Admin/ProfilePage'
import Opportunity from '../../views/Admin/Opportunity/index';
import OpportunityFormPage from '../../views/Admin/Opportunity/form';
import PriceList from '../../views/Admin/PriceList';
import PriceListForm from '../../views/Admin/PriceList/form';
import Account from '../../views/Admin/Account/index';
import AccountForm from '../../views/Admin/Account/form';
import ProductDetails from '../../views/Admin/productdetail';  
import Contact from '../../views/Admin/Contact/index';
import ContactForm from '../../views/Admin/Contact/form';
import LocationForm from '../../views/Admin/Location/form';
import Location from '../../views/Admin/Location/index';
import AdminRoute from '../../middleware/AdminRoute';
import ContactRoute from '../../middleware/isContactRoute';




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
