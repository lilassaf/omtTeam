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
  deleteLoading: false,
  deleteError: null,
  currentPage: 1,
  totalItems: 0,
  limit: 6,
  searchQuery: '',
  currentLocation: null,
  loadingLocation: false
};

// Async Thunks
export const getLocations = createAsyncThunk(
  'location/getall',
  async ({ page = 1, limit = 6, q = '' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${backendUrl}/api/location`, {
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

export const getOneLocation = createAsyncThunk(
  'location/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${backendUrl}/api/location/${id}`, { 
        headers: getHeaders(),
      });
      console.log(response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'location/delete',
  async (locationId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${backendUrl}/api/location/${locationId}`,
        { headers: getHeaders() }
      );
      return locationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    resetLocations: () => initialState,
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
      // Get All Locations
      .addCase(getLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalItems = action.payload.totalItems;
        state.limit = action.payload.limit;
      })
      .addCase(getLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get One Location
      .addCase(getOneLocation.pending, (state) => {
        state.loadingLocation = true;
        state.error = null;
      })
      .addCase(getOneLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.loadingLocation = false;
      })
      .addCase(getOneLocation.rejected, (state, action) => {
        state.error = action.payload;
        state.loadingLocation = false;
      })

      // Delete Location
      .addCase(deleteLocation.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.data = state.data.filter(location => location._id !== action.payload);
        state.totalItems -= 1;
        
        // Adjust current page if we deleted the last item on the page
        if (state.data.length === 0 && state.currentPage > 1) {
          state.currentPage -= 1;
        }
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  }
});

export const { 
  resetLocations, 
  setCurrentPage, 
  setSearchQuery,
  setLimit
} = locationSlice.actions;

export default locationSlice.reducer;