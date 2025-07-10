// src/store/auth/authActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;



export const userLogin = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/login', {
        username: username.trim(),
        password: password.trim()
      });
      
      if (!response.data?.user) {
        throw new Error('Invalid response structure');
      }
      
      const user = response.data.user;
      console.log(user);

      return {
        name: user.name,
        email: user.email || user.user_email,
        first_name: user.first_name,
        last_name: user.last_name,
        title: user.title,
        role: user.role,                     // simplified role: 'admin', 'contact', etc.
        isPrimaryContact: user.isPrimaryContact || false,  // new field
        contact: user.contact || null,       // new field
        city: user.city,
        country: user.country,
        phone: user.phone,
        mobile_phone: user.mobile_phone,
        last_login_time: user.last_login_time,
        photo: user.photo,
        active: user.active,
        manager: user.manager?.display_value || user.manager,
        user_name: user.user_name
      };
      
    } catch (err) {
      return rejectWithValue(handleApiError(err, 'Login failed'));
    }
  }
);


// Enhanced session checking
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/me');
      
      if (!response.data?.user) {
        return null;
      }

      // Return only the essential user data needed for the profile
      const user = response.data.user;
      return {
        name: user.name,
        email: user.email || user.user_email,
        first_name: user.first_name,
        last_name: user.last_name,
        title: user.title,
        role: user.role,                     // simplified role: 'admin', 'contact', etc.
        isPrimaryContact: user.isPrimaryContact || false,  // new field
        contact: user.contact || null,       // new field
        city: user.city,
        country: user.country,
        phone: user.phone,
        mobile_phone: user.mobile_phone,
        last_login_time: user.last_login_time,
        photo: user.photo,
        active: user.active,
        manager: user.manager?.display_value || user.manager,
        user_name: user.user_name
      };
      
    } catch (err) {
      if (err.response?.status === 401) {
        return null; // Session expired is not an error
      }
      return rejectWithValue(handleApiError(err, 'Session check failed'));
    }
  }
);
// Enhanced logout
export const userLogout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Attempt server logout but don't await completion
      const logoutPromise = api.post('/api/logout').catch(e => {
        console.error('Background logout failed:', e);
      });

      // Immediately clear local state
      return { 
        immediateLogout: true,
        // Track server logout completion in background
        serverLogout: logoutPromise
      };
      
    } catch (err) {
      // Still clear local state even if request fails
      return rejectWithValue({
        ...handleApiError(err, 'Logout completed with warnings'),
        immediateLogout: true,
        recoverable: true
      });
    }
  }
);

// Enhanced user info fetching
export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/me');
      return response.data?.user || null;
    } catch (err) {
      if (err.response?.status === 401) {
        return null; // Not logged in is not an error
      }
      return rejectWithValue(handleApiError(err, 'Failed to fetch user info'));
    }
  }
);

// Enhanced registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/request-registration', userData);
      
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err, 'Registration failed'));
    }
  }
);

export const createAccount = createAsyncThunk(
  'auth/createAccount',
  async (userData, { rejectWithValue }) => {
    console.log(userData)
    try {
      const response = await axios.post('/api/request-creation', userData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      if (response.data.error === 'email_exists') {
        return rejectWithValue('email_exists');
      }
      
      return response.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data.message || 'Registration failed');
      } else if (err.request) {
        return rejectWithValue('Network error. Please check your connection.');
      } else {
        return rejectWithValue('An error occurred while registering. Please try again.');
      }
    }
  }
);
