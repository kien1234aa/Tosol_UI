import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { markDirectoryFetchPending, markDirectoryFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import { getBankAccountDirectory } from './bankAccountAPI';
import type { BankAccountListResult } from './bankAccountResponseTypes';
import type {
  BankAccountListItem,
  BankAccountPaginationMeta,
} from './bankAccountResponseTypes';
import type {
  BankAccountIsDefaultFilter,
  BankAccountStatusFilter,
} from '@features/settings/bankAccount/bankAccountListFilterOptions';

/** Sá»‘ item tá»‘i \u0111a giá»¯ trong bá»™ nhá»› Redux (sliding window). */
export const BANK_ACCOUNT_LIST_MAX_WINDOW = 100;

const bankAccountErrorMessage = (error: unknown): string => {
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

export type FetchBankAccountDirectoryArg = {
  page: number;
  per_page: number;
  search?: string;
  status: BankAccountStatusFilter;
  /** `yes` = chá»‰ TK máº·c \u0111á»‹nh; `no` = chá»‰ TK khĂ´ng máº·c \u0111á»‹nh; `all` = khĂ´ng lá»c. */
  isDefaultFilter: BankAccountIsDefaultFilter;
  append?: boolean;
};

interface BankAccountState {
  directoryItems: BankAccountListItem[];
  directoryMeta: BankAccountPaginationMeta | null;
  directoryLoading: boolean;
  directoryRefreshing: boolean;
  directoryError: string | null;
  directoryLoadingMore: boolean;
  directoryWindowStart: number;
}

const initialState: BankAccountState = {
  directoryItems: [],
  directoryMeta: null,
  directoryLoading: false,
  directoryRefreshing: false,
  directoryError: null,
  directoryLoadingMore: false,
  directoryWindowStart: 0,
};

export const fetchBankAccountDirectory = createAsyncThunk<
  BankAccountListResult & { append: boolean },
  FetchBankAccountDirectoryArg,
  { rejectValue: string }
>('bankAccount/fetchBankAccountDirectory', async (arg, { rejectWithValue }) => {
  try {
    const isActive =
      arg.status === 'all' ? undefined : arg.status === 'active' ? true : false;
    const result = await getBankAccountDirectory({
      page: arg.page,
      per_page: arg.per_page,
      search: arg.search,
      isActive,
      ...(arg.isDefaultFilter === 'yes' || arg.isDefaultFilter === 'no'
        ? { isDefaultFilter: arg.isDefaultFilter }
        : {}),
    });
    return { ...result, append: arg.append === true };
  } catch (error: unknown) {
    return rejectWithValue(bankAccountErrorMessage(error));
  }
});

const bankAccountSlice = createSlice({
  name: 'bankAccount',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBankAccountDirectory.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.directoryLoadingMore = true;
        } else {
          markDirectoryFetchPending(state);
        }
      })
      .addCase(
        fetchBankAccountDirectory.fulfilled,
        (state, action: PayloadAction<BankAccountListResult & { append: boolean }>) => {
          state.directoryLoading = false;
          state.directoryRefreshing = false;
          state.directoryLoadingMore = false;
          state.directoryMeta = action.payload.meta;
          if (action.payload.append) {
            const MAX = BANK_ACCOUNT_LIST_MAX_WINDOW;
            const combined = [...state.directoryItems, ...action.payload.accounts];
            if (combined.length > MAX) {
              const dropped = combined.length - MAX;
              state.directoryItems = combined.slice(dropped);
              state.directoryWindowStart += dropped;
            } else {
              state.directoryItems = combined;
            }
          } else {
            state.directoryItems = action.payload.accounts;
            state.directoryWindowStart = 0;
          }
        },
      )
      .addCase(fetchBankAccountDirectory.rejected, (state, action) => {
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

export default bankAccountSlice.reducer;

