import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'authorization': `${localStorage.getItem('access_token')}`,
});

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  data: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  currentPage: 1,
  totalItems: 0,
  limit: 6,
  searchQuery: ''
};

// Async Thunks
export const getAccount = createAsyncThunk(
  'account/getall',
  async ({ page = 1, limit = 6, q = '' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${backendUrl}/api/account`, {
        headers: getHeaders(),
        params: { page, limit, q }
      });
      
      return {
        data: response.data.result || [],
        currentPage: page,
        totalItems: response.data.total || 0,
        limit
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createAccount = createAsyncThunk(
  'account/create',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/account`,
        accountData,
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOneAccount = createAsyncThunk(
  'account/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${backendUrl}/api/account/${id}`, { 
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const deleteAccount = createAsyncThunk(
  'account/delete',
  async (accountId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${backendUrl}/api/account/${accountId}`,
        { headers: getHeaders() }
      );
      return accountId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const verifyAccountToken = createAsyncThunk(
  'account/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/verify-account-token/${token}`,
        { headers: getHeaders() }
      );
      return response.data?.data || response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify token';
      return rejectWithValue(message);
    }
  }
)

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    resetAccounts: () => initialState,
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Accounts
      .addCase(getAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalItems = action.payload.totalItems;
        state.limit = action.payload.limit;
      })
      .addCase(getAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.data = state.data.filter(account => account._id !== action.payload);
        state.totalItems -= 1;
        
        // Adjust current page if we deleted the last item on the page
        if (state.data.length === 0 && state.currentPage > 1) {
          state.currentPage -= 1;
        }
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      .addCase(getOneAccount.pending, (state) => {
        state.loadingAccount = true;
        state.error = null;
      })
      .addCase(getOneAccount.fulfilled, (state, action) => {
        state.currentAccount = action.payload;
        state.loadingAccount = false;
      })
      .addCase(getOneAccount.rejected, (state, action) => {
        state.error = action.payload;
        state.loadingAccount = false;
      })

      .addCase(verifyAccountToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAccountToken.fulfilled, (state, action) => {
        state.loading = false;
        state.verifiedAccount = action.payload; // Add this to your initialState
      })
      .addCase(verifyAccountToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  resetAccounts, 
  setCurrentPage, 
  setSearchQuery,
  setLimit
} = accountSlice.actions;

export default accountSlice.reducer;