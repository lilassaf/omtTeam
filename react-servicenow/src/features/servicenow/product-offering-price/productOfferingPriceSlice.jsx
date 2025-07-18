import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {api} from "../../../utils/axioswithsession";



// 3. Product Offering Price CRUD operations
export const create = createAsyncThunk(
    'productOfferingPrice/create',
    async (productOfferingPriceData, { rejectWithValue }) => {
      try {
        const response = await api.post(
          `/api/product-offering-price`,
          productOfferingPriceData,
          
        );
        return response.data.result;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  );
  
//get Product offering prices
export const getAll = createAsyncThunk(
    'productOfferingPrice/getAll',
    async (_, { rejectWithValue }) => {
        try {
        const response = await api.get(
            `/api/product-offering-price`,
            
        );
        return response.data.result;
        } catch (error) {
        return rejectWithValue(error.response.data);
        }
    }
);

//get Product offering prices
export const getByPriceList = createAsyncThunk(
    'productOfferingPrice/getByPriceList',
    async (priceListId, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/api/product-offering-price-pl/${priceListId}`,
                
            );
            return response.data.result;
        } catch (error) {
            console.log(error)
        return rejectWithValue(error.response.data);
        }
    }
);


const initialState = {
productOfferingPrices:[],
loading: false,
error: null,
total: 0
};

const productOfferingPriceSlice = createSlice({
name: 'productOfferingPrice',
initialState,
reducers: {
    resetError: (state) => {
    state.error = null;
    },
    setCurrentPage: (state, action) => {
    state.currentPage = action.payload;
    },
},
extraReducers: (builder) => {
    builder

// Create Product Offering Price
    .addCase(create.pending, (state) => {
    state.loading = true;
    })
    .addCase(create.fulfilled, (state) => {
    state.loading = false;
    })
    .addCase(create.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload?.error?.message || 'Failed to create product offering price';
    })

    // Get Product Offering Prices
    .addCase(getAll.pending, (state) => {
    state.loading = true;
    })
    .addCase(getAll.fulfilled, (state, action) => {
    state.loading = false;
    state.productOfferingPrices = action.payload;
    })
    .addCase(getAll.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload?.error?.message || 'Failed to fetch sales cycle types';
    })

    // Get Product Offering Prices by Price List
    .addCase(getByPriceList.pending, (state) => {
    state.loading = true;
    })
    .addCase(getByPriceList.fulfilled, (state, action) => {
    state.loading = false;
    state.productOfferingPrices = action.payload;
    })
    .addCase(getByPriceList.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload?.error?.message || 'Failed to fetch sales cycle types';
    });
}
});

export default productOfferingPriceSlice.reducer;