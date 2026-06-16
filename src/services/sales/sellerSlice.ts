import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import { getSellerDashboard, type SellerDashboardParams } from './sellerAPI';
import type { SellerDashboardData } from './sellerResponseTypes';

const sellerErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === 'string') {
        return m;
      }
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Co loi xay ra';
};

interface SellerDashboardState {
  dashboard: SellerDashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

const initialState: SellerDashboardState = {
  dashboard: null,
  loading: false,
  refreshing: false,
  error: null,
};

export const fetchSellerDashboard = createAsyncThunk<
  SellerDashboardData,
  SellerDashboardParams,
  { rejectValue: string }
>('seller/fetchSellerDashboard', async (params, { rejectWithValue }) => {
  try {
    return await getSellerDashboard(params);
  } catch (error: unknown) {
    return rejectWithValue(sellerErrorMessage(error));
  }
});

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    clearSellerDashboardError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSellerDashboard.pending, state => {
        state.error = null;
        if (state.dashboard == null) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
      })
      .addCase(
        fetchSellerDashboard.fulfilled,
        (state, action: PayloadAction<SellerDashboardData>) => {
          state.loading = false;
          state.refreshing = false;
          state.dashboard = action.payload;
        },
      )
      .addCase(fetchSellerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Khong the tai dashboard ban hang';
      })
      .addCase(logout.fulfilled, state => {
        state.dashboard = null;
        state.error = null;
        state.loading = false;
        state.refreshing = false;
      })
      .addCase(logout.rejected, state => {
        state.dashboard = null;
        state.error = null;
        state.loading = false;
        state.refreshing = false;
      });
  },
});

export const { clearSellerDashboardError } = sellerSlice.actions;
export default sellerSlice.reducer;
