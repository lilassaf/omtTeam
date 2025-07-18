import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {api} from "../../../utils/axioswithsession";


// Async Thunks for each operation in the workflow

//workflow request call
export const workflow = createAsyncThunk(
  'opportunity/workflow',
  async (opportunityData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/opportunity-workflow`,
        opportunityData,
        
      );
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 1. Opportunity CRUD operations
export const createOpportunity = createAsyncThunk(
  'opportunity/createOpportunity',
  async (opportunityData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/opportunity`,
        opportunityData,
        
      );
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getOpportunities = createAsyncThunk(
  'opportunity/getOpportunities',
  async ({ page = 1, limit = 6, q }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/opportunity`,
        { 
          params: { page, limit, q }
         },
        
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//getOne Opportunity
export const getOpportunity = createAsyncThunk(
  'opportunity/getOpportunity',
  async ({id }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/opportunity/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOpportunityPricing = createAsyncThunk(
  'opportunity/updateOpportunityPricing',
  async ( {id, body} , { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/api/opportunity-edit/${id}`,
        body,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteOpportunity = createAsyncThunk(
  'opportunity/deleteOpportunity',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(
        `/api/opportunity/${id}`,
        
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Reference data fetchers
export const getSalesCycleTypes = createAsyncThunk(
  'opportunity/getSalesCycleTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/opportunity-sales-cycle-type`,
        
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getStages = createAsyncThunk(
  'opportunity/getStages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/opportunity-stage`,
        
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateStage = createAsyncThunk(
  'opportunity/updateStage',
  async (stageBody, { rejectWithValue }) => {
    try {
      console.log(stageBody);
      const response = await api.patch(
        `/api/opportunity-stage/${stageBody.id}`,
        stageBody,
        
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUnitOfMeasures = createAsyncThunk(
  'opportunity/getUnitOfMeasures',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/measurment-unit`,
        
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const generateContract = createAsyncThunk(
  'opportunity/generateContract',
  async (op_id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/opportunity-generate-contract/${op_id}`,
        {headers: getHeaders()},
        
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const downloadContract = createAsyncThunk(
  'opportunity/downloadContract',
  async (contract_id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/opportunity-download-contract/${contract_id}`,
        {
          headers: getHeaders(),
          responseType: 'blob'
        },
        
      );
      
      return {id: contract_id, file:response.data};
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


const initialState = {
  opportunities: [],
  salesCycleTypes: [],
  stages: [],
  accounts: [],
  unitOfMeasures: [],
  loading: false,
  partiallyLoading:false,
  error: null,
  currentPage: 1,
  totalItems: 0,
  limit: 6,
  totalPages: 1,
  currentOpportunity: null,
};

const opportunitySlice = createSlice({
  name: 'opportunity',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetData: (state) => {
      state.currentOpportunity = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      //workflow
      .addCase(workflow.pending, (state) => {
        state.loading = true;
      })
      .addCase(workflow.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities.unshift(action.payload);
      })
      .addCase(workflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to create opportunity';
      })
      // Create Opportunity
      .addCase(createOpportunity.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOpportunity.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities.unshift(action.payload);
      })
      .addCase(createOpportunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to create opportunity';
      })

      // Get Opportunities
      .addCase(getOpportunities.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload.pagination.page;
        state.totalPages = action.payload.pagination.totalPages;
        state.totalItems = action.payload.pagination.total;
        state.limit = action.payload.pagination.limit || 6;
        state.opportunities = action.payload.data;
      })
      .addCase(getOpportunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch opportunities';
      })

      //getOne Opportunity
      .addCase(getOpportunity.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOpportunity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOpportunity = action.payload.data;
      })
      .addCase(getOpportunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch Opportunity';
      })

      // Update Opportunity Pricing
      .addCase(updateOpportunityPricing.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOpportunityPricing.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.opportunities.findIndex(
          opp => opp._id === action.payload.data._id
        );
        if (index !== -1) {
          state.opportunities[index] = action.payload.data;
        }
      })
      .addCase(updateOpportunityPricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to update opportunity pricings';
      })

      // Update Opportunity Stage
      .addCase(updateStage.pending, (state) => {
        state.partiallyLoading = true;
      })
      .addCase(updateStage.fulfilled, (state, action) => {
        state.partiallyLoading = false;
        const index = state.opportunities.findIndex(
          opp => opp._id === action.payload.data._id
        );
        if (index !== -1) {
          state.opportunities[index] = action.payload.data;
        }
      })
      .addCase(updateStage.rejected, (state, action) => {
        state.partiallyLoading = false;
        state.error = action.payload?.error?.message || 'Failed to update opportunity stage';
      })

      // Delete Opportunity
      .addCase(deleteOpportunity.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOpportunity.fulfilled, (state, action) => {
        state.loading = false;
        state.opportunities = state.opportunities.filter(
          opp => opp._id !== action.payload
        );
      })
      .addCase(deleteOpportunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to delete opportunity';
      })

      // Get Sales Cycle Types
      .addCase(getSalesCycleTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesCycleTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.salesCycleTypes = action.payload;
      })
      .addCase(getSalesCycleTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch sales cycle types';
      })

      // Get Stages
      .addCase(getStages.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStages.fulfilled, (state, action) => {
        state.loading = false;
        state.stages = action.payload;
      })
      .addCase(getStages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch stages';
      })

      // Get Unit of Measures
      .addCase(getUnitOfMeasures.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUnitOfMeasures.fulfilled, (state, action) => {
        state.loading = false;
        state.unitOfMeasures = action.payload;
      })
      .addCase(getUnitOfMeasures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Failed to fetch unit of measures';
      })


      // Generate Contract
      .addCase(generateContract.pending, (state) => {
        state.partiallyLoading = true;
      })
      .addCase(generateContract.fulfilled, (state, action) => {
        state.partiallyLoading = false;
        const index = state.opportunities.findIndex(
          opp => opp._id === action.payload.opportunity
        );
        if (index !== -1) {
          state.opportunities[index].contract = action.payload;
        }
      })
      .addCase(generateContract.rejected, (state, action) => {
        state.partiallyLoading = false;
        state.error = action.payload?.error || 'Failed to generate contract';
      })


      // Download Contract
      .addCase(downloadContract.pending, (state) => {
        state.partiallyLoading = true;
      })
      .addCase(downloadContract.fulfilled, (state, action) => {
        const id =action.payload.id;
        const file = action.payload.file;
        state.partiallyLoading = false;
        const opportunity = state.opportunities.find(
          opp => opp.contract && opp.contract._id === id
        );

        let fileName = opportunity ? opportunity.contract.file_name :'contract.pdf';
        
        // Download the file
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .addCase(downloadContract.rejected, (state, action) => {
        state.partiallyLoading = false;
        state.error = action.payload?.error || 'Failed to download contract';
      });
  },
});

export const { resetError, resetData, setCurrentPage } = opportunitySlice.actions;

export default opportunitySlice.reducer;