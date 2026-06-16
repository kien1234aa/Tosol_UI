import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { markDirectoryFetchPending, markDirectoryFetchSettled, markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import {
  getSellerStaffDirectory,
  getStaffUserTotals,
  type StaffUserDirectoryResult,
} from './staffAPI';
import type { StaffUserApi, StaffUsersListMeta } from './staffApiTypes';

/** Sá»‘ item tá»‘i \u0111a giá»¯ trong bá»™ nhá»› Redux (sliding window). */
export const STAFF_LIST_MAX_WINDOW = 100;

const staffErrorMessage = (error: unknown): string => {
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

export type FetchStaffUserDirectoryArg = {
  page: number;
  per_page: number;
  search?: string;
  status: 'all' | 'active' | 'inactive';
  role: 'all' | 'admin' | 'staff';
  append?: boolean;
};

export type StaffUserCounts = {
  all: number;
  active: number;
  inactive: number;
};

interface SellerStaffState {
  directoryItems: StaffUserApi[];
  directoryMeta: StaffUsersListMeta | null;
  directoryLoading: boolean;
  directoryRefreshing: boolean;
  directoryError: string | null;
  directoryLoadingMore: boolean;
  directoryWindowStart: number;
  counts: StaffUserCounts;
  countsLoading: boolean;
  countsError: string | null;
}

const initialState: SellerStaffState = {
  directoryItems: [],
  directoryMeta: null,
  directoryLoading: false,
  directoryRefreshing: false,
  directoryError: null,
  directoryLoadingMore: false,
  directoryWindowStart: 0,
  counts: { all: 0, active: 0, inactive: 0 },
  countsLoading: false,
  countsError: null,
};

export const fetchStaffUserDirectory = createAsyncThunk<
  StaffUserDirectoryResult & { append: boolean },
  FetchStaffUserDirectoryArg,
  { rejectValue: string }
>('sellerStaff/fetchStaffUserDirectory', async (arg, { rejectWithValue }) => {
  try {
    const isActive =
      arg.status === 'all' ? undefined : arg.status === 'active' ? true : false;
    const role = arg.role === 'all' ? undefined : arg.role;
    const result = await getSellerStaffDirectory({
      page: arg.page,
      per_page: arg.per_page,
      search: arg.search,
      isActive,
      role,
    });
    return { ...result, append: arg.append === true };
  } catch (error: unknown) {
    return rejectWithValue(staffErrorMessage(error));
  }
});

export const fetchStaffUserCounts = createAsyncThunk<
  StaffUserCounts,
  void,
  { rejectValue: string }
>('sellerStaff/fetchStaffUserCounts', async (_, { rejectWithValue }) => {
  try {
    return await getStaffUserTotals();
  } catch (error: unknown) {
    return rejectWithValue(staffErrorMessage(error));
  }
});

const sellerStaffSlice = createSlice({
  name: 'sellerStaff',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchStaffUserDirectory.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.directoryLoadingMore = true;
        } else {
          markDirectoryFetchPending(state);
        }
      })
      .addCase(
        fetchStaffUserDirectory.fulfilled,
        (state, action: PayloadAction<StaffUserDirectoryResult & { append: boolean }>) => {
          state.directoryLoading = false;
          state.directoryRefreshing = false;
          state.directoryLoadingMore = false;
          state.directoryMeta = action.payload.meta;
          if (action.payload.append) {
            const MAX = STAFF_LIST_MAX_WINDOW;
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
      .addCase(fetchStaffUserDirectory.rejected, (state, action) => {
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
      .addCase(fetchStaffUserCounts.pending, state => {
        state.countsLoading = true;
        state.countsError = null;
      })
      .addCase(
        fetchStaffUserCounts.fulfilled,
        (state, action: PayloadAction<StaffUserCounts>) => {
          state.countsLoading = false;
          state.counts = action.payload;
        },
      )
      .addCase(fetchStaffUserCounts.rejected, (state, action) => {
        state.countsLoading = false;
        state.countsError =
          typeof action.payload === 'string'
            ? action.payload
            : 'KhĂ´ng táº£i \u0111Æ°á»£c thá»‘ng kĂª';
      })
      .addCase(logout.fulfilled, state => {
        state.directoryItems = [];
        state.directoryMeta = null;
        state.directoryError = null;
        state.directoryLoading = false;
        state.directoryRefreshing = false;
        state.directoryLoadingMore = false;
        state.directoryWindowStart = 0;
        state.counts = { all: 0, active: 0, inactive: 0 };
        state.countsError = null;
        state.countsLoading = false;
      })
      .addCase(logout.rejected, state => {
        state.directoryItems = [];
        state.directoryMeta = null;
        state.directoryError = null;
        state.directoryLoading = false;
        state.directoryRefreshing = false;
        state.directoryLoadingMore = false;
        state.directoryWindowStart = 0;
        state.counts = { all: 0, active: 0, inactive: 0 };
        state.countsError = null;
        state.countsLoading = false;
      });
  },
});

export default sellerStaffSlice.reducer;

