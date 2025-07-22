import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthToken, selectIsAuthenticated } from '../../features/auth/client/auth'; // Import your selectors
import { jwtDecode } from 'jwt-decode';

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

const IsAuth = ({ children }) => {
  // Get auth state from Redux
  const token = useSelector(selectAuthToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Check if token exists and is valid
  const isTokenValid = token && TokenValid(token);

  // If authenticated with valid token, redirect to dashboard
  if (!isAuthenticated && !isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default IsAuth;