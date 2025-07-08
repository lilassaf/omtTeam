import { createSlice } from '@reduxjs/toolkit';
import { userLogin, userLogout, fetchUserInfo } from './authActions';
import CryptoJS from 'crypto-js';

// Encryption configuration
const SECRET_KEY = 'Rk$8zE9!v&7Bq@pFjR2LpT%yXdWmZg';

// Encryption/decryption helpers
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.error('Decryption failed', e);
    return null;
  }
};

const loadInitialState = () => {
  const encryptedData = localStorage.getItem('authState');
  if (!encryptedData) return {
    loading: false,
    userInfo: null,
    error: null,
    isAuthenticated: false,
    pendingLogout: null,
  };

  try {
    const decrypted = decryptData(encryptedData);
    if (decrypted?.userInfo && typeof decrypted.isAuthenticated === 'boolean') {
      return {
        ...decrypted,
        loading: false,
        error: null,
        pendingLogout: null,
      };
    }
    localStorage.removeItem('authState');
    return {
      loading: false,
      userInfo: null,
      error: null,
      isAuthenticated: false,
      pendingLogout: null,
    };
  } catch (e) {
    localStorage.removeItem('authState');
    return {
      loading: false,
      userInfo: null,
      error: null,
      isAuthenticated: false,
      pendingLogout: null,
    };
  }
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => {
      localStorage.removeItem('authState');
      return loadInitialState();
    },
    completeBackgroundLogout: (state) => {
      state.pendingLogout = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload;
        state.isAuthenticated = true;
        localStorage.setItem('authState', encryptData({
          userInfo: payload,
          isAuthenticated: true,
        }));
      })
      .addCase(userLogin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(userLogout.pending, (state) => {
        state.loading = true;
      })
      .addCase(userLogout.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.isAuthenticated = false;
        localStorage.removeItem('authState');
      })
      .addCase(userLogout.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.userInfo = null;
        state.isAuthenticated = false;
        localStorage.removeItem('authState');
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserInfo.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload;
        state.isAuthenticated = true;
        localStorage.setItem('authState', encryptData({
          userInfo: payload,
          isAuthenticated: true,
        }));
      })
      .addCase(fetchUserInfo.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.userInfo = null;
        state.isAuthenticated = false;
        localStorage.removeItem('authState');
      });
  },
});

export const { resetAuth, completeBackgroundLogout } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.userInfo;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectPendingLogout = (state) => state.auth.pendingLogout;

export default authSlice.reducer;