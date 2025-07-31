import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {api} from "../../../utils/axioswithsession";


// Async Thunks
export const getQuotes = createAsyncThunk(
  'quotes/getall',
  async ({ page = 1, limit = 6, q = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/quote`, {
        params: { page, limit, q }
      });
      return response.data || { data: [], page: 1, totalPages: 1, total: 0 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getQuote = createAsyncThunk(
  'quotes/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/quote/${id}`,
        
      );    
      console.log(response.data );
        
      return response.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createQuote = createAsyncThunk(
  'quotes/create',
  async (opportunityId, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/quote/${opportunityId}`, 
        {},
        
      );
      return response.data?.result || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateQuoteState = createAsyncThunk(
  'quotes/updateState',
  async ({ id, state }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/api/quote-state/${id}`,
        { state },
        
      );
      //create case from quote
      const response2 = await api.post(`/api/quote-to-case/${id}`);
      return response.data.result || null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        error.message
      );
    }
  }
);

export const updateQuote = createAsyncThunk(
  'quotes/update',
  async ({ id, ...quoteData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/api/quote/${id}`,
        quoteData,
        
      );
      return response.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteQuote = createAsyncThunk(
  'quotes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(
        `/api/quote/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const quoteSlice = createSlice({
  name: 'quote',
  initialState: { 
    data: [],
    currentQuote: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 6,
    loading: false,
    loadingQuote: false,
    error: null
  },
  reducers: {
    resetQuotes: () => initialState,
    resetCurrentQuote: (state) => {
      state.currentQuote = null;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // getQuotes
      .addCase(getQuotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuotes.fulfilled, (state, action) => {
        state.data = action.payload.data ;         
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.totalItems = action.payload.total || 0;
        state.limit = action.meta.arg?.limit || 6;
        state.loading = false;
      })
      .addCase(getQuotes.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // getQuote
      .addCase(getQuote.pending, (state) => {
        state.loadingQuote = true;
        state.error = null;
      })
      .addCase(getQuote.fulfilled, (state, action) => {
        state.currentQuote = action.payload;
        state.loadingQuote = false;
      })
      .addCase(getQuote.rejected, (state, action) => {
        state.error = action.payload;
        state.loadingQuote = false;
      })
      
      // createQuote
      .addCase(createQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        if (action.payload) {
          state.data.unshift(action.payload);
          state.totalItems += 1;
        }
        state.loading = false;
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // updateQuote
      .addCase(updateQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.data.findIndex(q => q._id === action.payload._id);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
          if (state.currentQuote?._id === action.payload._id) {
            state.currentQuote = action.payload;
          }
        }
        state.loading = false;
      })
      .addCase(updateQuote.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // updateQuoteState
      .addCase(updateQuoteState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuoteState.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.data.findIndex(q => q._id === action.payload._id);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
          if (state.currentQuote?._id === action.payload._id) {
            state.currentQuote = action.payload;
          }
        }
        state.loading = false;
      })
      .addCase(updateQuoteState.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // deleteQuote
      .addCase(deleteQuote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.data = state.data.filter(q => q._id !== action.payload);
        state.totalItems = Math.max(0, state.totalItems - 1);
        if (state.currentQuote?._id === action.payload) {
          state.currentQuote = null;
        }
        state.loading = false;
      })
      .addCase(deleteQuote.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { resetQuotes, resetCurrentQuote, setPage, setSearchQuery } = quoteSlice.actions;
export default quoteSlice.reducer;
