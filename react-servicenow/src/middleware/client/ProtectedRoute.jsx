import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';
import {
  selectClientAuthToken,
  selectIsClientAuthenticated,
  selectClientAuthRole,
} from '../../features/client/auth'; // Update path as needed

const TokenValid = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (e) {
    return false;
  }
};

const ProtectedRoute = ({
  roles,
  redirectPath = '/login',
  children,
}) => {
  const token = useSelector(selectClientAuthToken);
  const isAuthenticated = useSelector(selectIsClientAuthenticated);
  const userRole = useSelector(selectClientAuthRole);
  const location = useLocation();
  const isTokenValid = TokenValid(token);

  

  // If token is invalid or user is not authenticated, redirect to login
  if (!isTokenValid || !isAuthenticated) {
    return (
      <Navigate 
        to={redirectPath} 
        replace 
      />
    );
  }

  // If roles are specified but user doesn't have required role
  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const hasRequiredRole = allowedRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/403" 
          state={{ from: location }}
          replace 
        />
      );
    }
  }

  // Render children if provided, otherwise render Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;