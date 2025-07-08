import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {api} from "../../../utils/axioswithsession";




// Async Thunk for contract generation
export const generateContract = createAsyncThunk(
  'contractQ/generate',
  async (dataBody, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/contract-quote/`,
        dataBody,
        
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



// Slice
const contractQSlice = createSlice({
  name: 'contractQ',
  initialState: {
    generatedContract: null,
    loading: false,        // Loading state for generation
    error: null,           // Error for generation
  },
  reducers: {
    clearGeneratedContract: (state) => {
      state.generatedContract = null;
    },
    clearContractError: (state) => {
      state.error = null;
    },
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
      })
      .addCase(generateContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearGeneratedContract,
  clearContractError,
} = contractQSlice.actions;

export default contractQSlice.reducer;