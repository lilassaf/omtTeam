import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper functions for localStorage
const saveAuthData = (data) => {
  localStorage.setItem('clientData', JSON.stringify({
    token: data.id_token,
    role: data.role,
  }));
};

const clearAuthData = () => {
  localStorage.removeItem('clientData');
};

const getAuthData = () => {
  const data = localStorage.getItem('clientData');  
  return data ? JSON.parse(data) : null;
};

// Async Thunks
export const loginClient = createAsyncThunk(
  'authClient/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/client-login`, { email, password });
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error_description || 
        error.response?.data?.message || 
        'Client login failed'
      );
    }
  }
);

export const logoutClient = createAsyncThunk(
  'authClient/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().authClient.token;
      if (token) {
        await axios.post(`${API_URL}/api/client-logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      clearAuthData();
      return true;
    } catch (error) {
      clearAuthData();
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authClientSlice = createSlice({
  name: 'authClient',
  initialState: () => {
    const savedAuth = getAuthData();
    return {
      token: savedAuth?.token || null,
      role: savedAuth?.role || null,
      email: savedAuth?.email || null,
      name: savedAuth?.name || null,
      isLoading: false,
      error: null
    };
  },
  reducers: {
    clearClientAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginClient.fulfilled, (state, action) => {      
        state.token = action.payload.id_token;
        state.role = action.payload.role;
        state.email = action.payload.email || null;
        state.name = action.payload.name || null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginClient.rejected, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.role = null;
        state.email = null;
        state.name = null;
        state.error = action.payload;
        clearAuthData();
      })
      .addCase(logoutClient.fulfilled, (state) => {
        state.token = null;
        state.role = null;
        state.email = null;
        state.name = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutClient.rejected, (state) => {
        state.token = null;
        state.role = null;
        state.email = null;
        state.name = null;
        state.isLoading = false;
        state.error = null;
      });
  }
});

// Selectors
export const selectClientAuthToken = (state) => state.authClient.token;
export const selectClientAuthRole = (state) => state.authClient.role;
export const selectClientAuthEmail = (state) => state.authClient.email;
export const selectClientAuthName = (state) => state.authClient.name;
export const selectClientAuthLoading = (state) => state.authClient.isLoading;
export const selectClientAuthError = (state) => state.authClient.error;
export const selectIsClientAuthenticated = (state) => !!state.authClient.token;

export const { clearClientAuthError } = authClientSlice.actions;
export default authClientSlice.reducer;