import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { markDirectoryFetchPending, markDirectoryFetchSettled, markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import {
  getSellerWebhookDirectory,
  type SellerWebhookDirectoryResult,
} from './webhookAPI';
import type {
  SellerWebhookApi,
  SellerWebhooksListMeta,
} from './webhookApiTypes';

/** Sá»‘ item tá»‘i \u0111a giá»¯ trong bá»™ nhá»› Redux (sliding window). */
export const WEBHOOK_LIST_MAX_WINDOW = 100;

const webhookErrorMessage = (error: unknown): string => {
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

export type FetchSellerWebhookDirectoryArg = {
  page: number;
  per_page: number;
  search?: string;
  status: 'all' | 'active' | 'inactive';
  append?: boolean;
};

interface SellerWebhookState {
  directoryItems: SellerWebhookApi[];
  directoryMeta: SellerWebhooksListMeta | null;
  directoryLoading: boolean;
  directoryRefreshing: boolean;
  directoryError: string | null;
  directoryLoadingMore: boolean;
  directoryWindowStart: number;
}

const initialState: SellerWebhookState = {
  directoryItems: [],
  directoryMeta: null,
  directoryLoading: false,
  directoryRefreshing: false,
  directoryError: null,
  directoryLoadingMore: false,
  directoryWindowStart: 0,
};

export const fetchSellerWebhookDirectory = createAsyncThunk<
  SellerWebhookDirectoryResult & { append: boolean },
  FetchSellerWebhookDirectoryArg,
  { rejectValue: string }
>(
  'sellerWebhook/fetchSellerWebhookDirectory',
  async (arg, { rejectWithValue }) => {
    try {
      const isActive =
        arg.status === 'all'
          ? undefined
          : arg.status === 'active'
          ? true
          : false;
      const result = await getSellerWebhookDirectory({
        page: arg.page,
        per_page: arg.per_page,
        search: arg.search,
        isActive,
      });
      return { ...result, append: arg.append === true };
    } catch (error: unknown) {
      return rejectWithValue(webhookErrorMessage(error));
    }
  },
);

const sellerWebhookSlice = createSlice({
  name: 'sellerWebhook',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSellerWebhookDirectory.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.directoryLoadingMore = true;
        } else {
          markDirectoryFetchPending(state);
        }
      })
      .addCase(
        fetchSellerWebhookDirectory.fulfilled,
        (state, action: PayloadAction<SellerWebhookDirectoryResult & { append: boolean }>) => {
          state.directoryLoading = false;
          state.directoryRefreshing = false;
          state.directoryLoadingMore = false;
          state.directoryMeta = action.payload.meta;
          if (action.payload.append) {
            const MAX = WEBHOOK_LIST_MAX_WINDOW;
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
      .addCase(fetchSellerWebhookDirectory.rejected, (state, action) => {
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

export default sellerWebhookSlice.reducer;

