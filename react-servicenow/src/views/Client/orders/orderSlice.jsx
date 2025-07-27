import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'authorization': `${localStorage.getItem('clientData')}`,
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
export const getOrder = createAsyncThunk(
  'order/getall',
  async ({ page = 1, limit = 6, q = '' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${backendUrl}/api/order`, {
        headers: getHeaders(),
        params: { page, limit, q }
      });
      return {
        data: response.data.data || [],
        currentPage: page,
        totalItems: response.data.total || 0,
        limit
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getOneOrder = createAsyncThunk(
  'order/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/${id}`, { 
        headers: getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrders: () => initialState,
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
      // Get All Orders
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalItems = action.payload.totalItems;
        state.limit = action.payload.limit;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOneOrder.pending, (state) => {
        state.loadingOrder = true;
        state.error = null;
      })
      .addCase(getOneOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loadingOrder = false;
      })
      .addCase(getOneOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loadingOrder = false;
      })

  }
});

export const { 
  resetOrders, 
  setCurrentPage, 
  setSearchQuery,
  setLimit
} = orderSlice.actions;

export default orderSlice.reducer;