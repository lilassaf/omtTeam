import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from "../../../utils/axiosForClient";

// Async Thunks
export const getQuotesByContact = createAsyncThunk(
  'quotes/getByContact',
  async ({  page = 1, limit = 10, q = '' }, { rejectWithValue }) => {
    try {
      console.log('m here');
      
      const response = await apiClient.get(`/api/client/quote`, {
        params: { page, limit, q }
      });
      console.log(response);
      
      return {
        data: response.data?.data || [],
        page: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        total: response.data?.total || 0,
        searchQuery: q
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getQuoteDetails = createAsyncThunk(
  'quotes/getDetails',
  async (quoteId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/quotes/${quoteId}`);
      return response.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const quotesByContactSlice = createSlice({
  name: 'quotesByContact',
  initialState: { 
    quotes: [],
    currentQuote: null,
    currentContactId: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    },
    searchQuery: '',
    loading: false,
    loadingDetails: false,
    error: null,
    updating: false,
    deleting: false
  },
  reducers: {
    resetQuotesByContact: (state) => {
      state.quotes = [];
      state.currentQuote = null;
      state.currentContactId = null;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
      };
      state.searchQuery = '';
      state.error = null;
    },
    setQuotesPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setQuotesLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    setQuotesSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrentQuote: (state) => {
      state.currentQuote = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getQuotesByContact
      .addCase(getQuotesByContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuotesByContact.fulfilled, (state, action) => {
        state.quotes = action.payload.data;
        state.currentContactId = action.payload.contactId;
        state.pagination = {
          page: action.payload.page,
          limit: action.meta.arg?.limit || 10,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
        state.searchQuery = action.payload.searchQuery || '';
        state.loading = false;
      })
      .addCase(getQuotesByContact.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // getQuoteDetails
      .addCase(getQuoteDetails.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(getQuoteDetails.fulfilled, (state, action) => {
        state.currentQuote = action.payload;
        state.loadingDetails = false;
      })
      .addCase(getQuoteDetails.rejected, (state, action) => {
        state.error = action.payload;
        state.loadingDetails = false;
      });
  }
});

export const { 
  resetQuotesByContact,
  setQuotesPage,
  setQuotesLimit,
  setQuotesSearchQuery,
  clearCurrentQuote
} = quotesByContactSlice.actions;

export default quotesByContactSlice.reducer;