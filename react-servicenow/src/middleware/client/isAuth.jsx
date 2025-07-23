import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';
import { selectClientAuthToken } from '../../features/auth/client/auth'; // Update path as needed

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
  // Get token from Redux state instead of localStorage
  const token = useSelector(selectClientAuthToken);
  const isTokenValid = TokenValid(token);

  // Redirect to login if no valid token exists
  if (!isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default IsAuth;