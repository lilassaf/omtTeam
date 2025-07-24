import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {api} from "../../../utils/axioswithsession";




// Async Thunk for contract generation
export const getContractModels = createAsyncThunk(
  'contractModel/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/contract-model/`,
        
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
const contractModelSlice = createSlice({
  name: 'contractModel',
  initialState: {
    contractModels: [],
    loading: false,        // Loading state for generation
    error: null,           // Error for generation
  },
  reducers: {
    clearContractModels: (state) => {
      state.contractModels = [];
    },
    clearContractError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Contract
      .addCase(getContractModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContractModels.fulfilled, (state, action) => {
        state.loading = false;
        state.contractModels = action.payload;
      })
      .addCase(getContractModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearContractModels,
  clearContractError,
} = contractModelSlice.actions;

export default contractModelSlice.reducer;