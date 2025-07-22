import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const getAuthData = () => {
  try {
    const data = localStorage.getItem('clientData');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to parse auth data:', e);
    return null;
  }
};

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
  const authData = getAuthData();
  const isTokenValid = TokenValid(authData?.token);

  // Redirect to login if no valid token exists
  if (!isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default IsAuth;