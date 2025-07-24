// src/routes/authRoutes.jsx
import React from 'react';
import Register from '../../views/auth/Register.jsx';
import Login from '../../views/auth/login.jsx';
import IsAuth from '../../middleware/IsAuth.jsx';
import CreateAcc from '../../components/createAccount/CreateAcc.jsx';
import VerifyToken from '../../middleware/VerifyToken.jsx';
import VerificationErrorPage from '../../views/error/VerificationErrorPage.jsx';
import Home from '../../views/auth/Home.jsx';

const authRoutes = [
  // { path: '/', element: <Login /> },
  // { path: '/register', element: <Register /> },
  
  {
    path: '/',
    element: <Home />,  // Home should not be wrapped with IsAuth
  },
  {
    path: '/login',
    element: (
      <IsAuth>
        <Login />
      </IsAuth>
    ),
  },
  { path: '/createAccount', element:<VerifyToken><CreateAcc /></VerifyToken> },
  { path: '/verification-error', element: <VerificationErrorPage /> }
  // ... other routes
];

export default authRoutes;