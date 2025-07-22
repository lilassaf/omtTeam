import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


const API_URL = import.meta.env.VITE_BACKEND_URL;


// Helper functions for localStorage
const saveAuthData = (data) => {
  localStorage.setItem('clientData', JSON.stringify({
    token: data.id_token,
    role: data.role,
    email: data.email || 'ntg' // Using sub (subject) from JWT if email not in response
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
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/client-login`, { email, password });
      saveAuthData(response.data);
      return response.data;
      
      
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error_description || 
        error.response?.data?.message || 
        'Login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (token) {
        await axios.post(`${API_URL}/api/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      clearAuthData();
      return true;
    } catch (error) {
      // Even if logout API fails, we still want to clear local data
      clearAuthData();
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: () => {
    const savedAuth = getAuthData();
    return {
      token: savedAuth?.token || null,
      role: savedAuth?.role || null,
      email: savedAuth?.email || null,
      isLoading: false,
      error: null
    };
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(action);
        state.token = action.payload.id_token;
        state.role = action.payload.role;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.role = null;
        state.email = null;
        state.error = action.payload;
        clearAuthData();
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.role = null;
        state.email = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if API logout failed, we still clear the local state
        state.token = null;
        state.role = null;
        state.email = null;
        state.isLoading = false;
        state.error = null;
      });
  }
});

// Selectors
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthRole = (state) => state.auth.role;
export const selectAuthEmail = (state) => state.auth.email;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => !!state.auth.token;

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;