// src/routes/authRoutes.jsx
import React from 'react';
import Register from '../../auth/Register';
import Login from '../../auth/login';

// routes/auth.js
const authRoutes = [
  { path: '/', element: <Login /> },
  { path: '/register', element:
    <Register /> 
    },
  // ... other routes
];

export default authRoutes;                                                                                                                                                