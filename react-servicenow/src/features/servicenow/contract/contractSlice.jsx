import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import dayjs from 'dayjs';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Helper function to get authorization headers
const getHeaders = () => {
  const access_token = localStorage.getItem('access_token');
  return { 
    authorization: access_token,
    'Content-Type': 'application/json'
  };
};

// Async Thunk for contract generation
export const generateContract = createAsyncThunk(
  'contract/generate',
  async ({ quoteId, signature }, { rejectWithValue }) => { // Accept signature parameter
    try {
      const response = await axios.post(
        `${backendUrl}/api/contract/${quoteId}`,
        { signature }, // Include signature in request body
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message
      );
    }
  }
);

// Async Thunk for downloading contract
export const downloadContract = createAsyncThunk(
  'contract/download',
  async ({ contractId, quoteNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/download-contract/${contractId}`,
        {
          headers: getHeaders(),
          responseType: 'blob'
        }
      );
    
      const sanitizedQuoteNumber = (quoteNumber || 'unknown').replace(/[^\w\-]/g, '_');
      const finalFileName = `contract-${sanitizedQuoteNumber}-${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`;
  
      return {
        id: contractId,
        content: response.data,
        fileName: response.headers['content-disposition']
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || finalFileName
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message
      );
    }
  }
);

// Slice
const contractSlice = createSlice({
  name: 'contract',
  initialState: {
    generatedContract: null,
    download: null,
    loading: false,
    downloading: false,
    error: null,
    downloadError: null,
    signature: null // Store signature separately if needed
  },
  reducers: {
    clearGeneratedContract: (state) => {
      state.generatedContract = null;
    },
    clearContractError: (state) => {
      state.error = null;
    },
    clearDownload: (state) => {
      state.download = null;
    },
    clearDownloadError: (state) => {
      state.downloadError = null;
    },
    setSignature: (state, action) => {
      state.signature = action.payload;
    },
    clearSignature: (state) => {
      state.signature = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Contract
      .addCase(generateContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateContract.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedContract = action.payload;
        state.error = null;
      })
      .addCase(generateContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Download Contract
      .addCase(downloadContract.pending, (state) => {
        state.downloading = true;
        state.downloadError = null;
      })
      .addCase(downloadContract.fulfilled, (state, action) => {
        state.downloading = false;
        state.download = action.payload;
        state.downloadError = null;
      })
      .addCase(downloadContract.rejected, (state, action) => {
        state.downloading = false;
        state.downloadError = action.payload;
      });
  }
});

export const {
  clearGeneratedContract,
  clearContractError,
  clearDownload,
  clearDownloadError,
  setSignature,
  clearSignature
} = contractSlice.actions;

export default contractSlice.reducer;