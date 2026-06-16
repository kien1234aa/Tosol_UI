import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { markDirectoryFetchPending, markDirectoryFetchSettled, markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import {
  getSellerShippingPartnerDirectory,
  type SellerShippingPartnerDirectoryResult,
} from './shipPartnerAPI';
import type {
  SellerShippingPartnerApi,
  SellerShippingPartnersListMeta,
} from './shipApiTypes';

/** Sá»‘ item tá»‘i \u0111a giá»¯ trong bá»™ nhá»› Redux (sliding window). */
export const SHIP_PARTNER_LIST_MAX_WINDOW = 100;

const shipPartnerErrorMessage = (error: unknown): string => {
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
  return 'CĂ³ lá»—i xáº£y ra';
};

export type FetchShipPartnerDirectoryArg = {
  page: number;
  per_page: number;
  search?: string;
  status: 'all' | 'active' | 'inactive';
  append?: boolean;
};

interface ShipPartnerState {
  directoryItems: SellerShippingPartnerApi[];
  directoryMeta: SellerShippingPartnersListMeta | null;
  directoryLoading: boolean;
  directoryRefreshing: boolean;
  directoryError: string | null;
  directoryLoadingMore: boolean;
  directoryWindowStart: number;
}

const initialState: ShipPartnerState = {
  directoryItems: [],
  directoryMeta: null,
  directoryLoading: false,
  directoryRefreshing: false,
  directoryError: null,
  directoryLoadingMore: false,
  directoryWindowStart: 0,
};

export const fetchShipPartnerDirectory = createAsyncThunk<
  SellerShippingPartnerDirectoryResult & { append: boolean },
  FetchShipPartnerDirectoryArg,
  { rejectValue: string }
>('shipPartner/fetchShipPartnerDirectory', async (arg, { rejectWithValue }) => {
  try {
    const isActive =
      arg.status === 'all' ? undefined : arg.status === 'active' ? true : false;
    const result = await getSellerShippingPartnerDirectory({
      page: arg.page,
      per_page: arg.per_page,
      search: arg.search,
      isActive,
    });
    return { ...result, append: arg.append === true };
  } catch (error: unknown) {
    return rejectWithValue(shipPartnerErrorMessage(error));
  }
});

const shipPartnerSlice = createSlice({
  name: 'shipPartner',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchShipPartnerDirectory.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.directoryLoadingMore = true;
        } else {
          markDirectoryFetchPending(state);
        }
      })
      .addCase(
        fetchShipPartnerDirectory.fulfilled,
        (
          state,
          action: PayloadAction<SellerShippingPartnerDirectoryResult & { append: boolean }>,
        ) => {
          state.directoryLoading = false;
          state.directoryRefreshing = false;
          state.directoryLoadingMore = false;
          state.directoryMeta = action.payload.meta;
          if (action.payload.append) {
            const MAX = SHIP_PARTNER_LIST_MAX_WINDOW;
            const combined = [...state.directoryItems, ...action.payload.items];
            if (combined.length > MAX) {
              const dropped = combined.length - MAX;
              state.directoryItems = combined.slice(dropped);
              state.directoryWindowStart += dropped;
            } else {
              state.directoryItems = combined;
            }
          } else {
            state.directoryItems = action.payload.items;
            state.directoryWindowStart = 0;
          }
        },
      )
      .addCase(fetchShipPartnerDirectory.rejected, (state, action) => {
        state.directoryLoading = false;
        state.directoryRefreshing = false;
        state.directoryLoadingMore = false;
        state.directoryError =
          typeof action.payload === 'string'
            ? action.payload
            : 'KhĂ´ng táº£i \u0111Æ°á»£c danh sĂ¡ch';
        state.directoryItems = [];
        state.directoryMeta = null;
      })
      .addCase(logout.fulfilled, state => {
        state.directoryItems = [];
        state.directoryMeta = null;
        state.directoryError = null;
        state.directoryLoading = false;
        state.directoryRefreshing = false;
        state.directoryLoadingMore = false;
        state.directoryWindowStart = 0;
      })
      .addCase(logout.rejected, state => {
        state.directoryItems = [];
        state.directoryMeta = null;
        state.directoryError = null;
        state.directoryLoading = false;
        state.directoryRefreshing = false;
        state.directoryLoadingMore = false;
        state.directoryWindowStart = 0;
      });
  },
});

export default shipPartnerSlice.reducer;

