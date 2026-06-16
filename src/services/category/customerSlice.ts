import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import {
  createCustomer,
  searchCustomers,
  type SearchCustomersResult,
} from './customerAPI';
import type {
  CreateCustomerPayload,
  CustomerSearchItem,
} from './customerApiTypes';
import { mapCustomerListRowToSearchItem } from './customerApiTypes';

const customerErrorMessage = (error: unknown): string => {
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
  return 'Có lỗi xảy ra';
};

export type CustomerSearchPayload = SearchCustomersResult & { query: string };

type CustomerState = {
  searchHits: CustomerSearchItem[];
  searchLoading: boolean;
  searchError: string | null;
  pendingSearch: string | null;
};

const initialState: CustomerState = {
  searchHits: [],
  searchLoading: false,
  searchError: null,
  pendingSearch: null,
};

export const searchCustomersByQuery = createAsyncThunk<
  CustomerSearchPayload,
  string,
  { rejectValue: string }
>(
  'customer/searchByQuery',
  async (rawSearch, { rejectWithValue, signal }) => {
    const search = rawSearch.trim();
    try {
      const result = await searchCustomers({ search, perPage: 20, signal });
      return { ...result, query: search };
    } catch (error: unknown) {
      return rejectWithValue(customerErrorMessage(error));
    }
  },
  {
    condition: rawSearch => rawSearch.trim().length > 2,
  },
);

export const createCustomerThunk = createAsyncThunk<
  CustomerSearchItem,
  CreateCustomerPayload,
  { rejectValue: string }
>('customer/create', async (payload, { rejectWithValue }) => {
  try {
    const row = await createCustomer(payload);
    const item = mapCustomerListRowToSearchItem(row);
    return item;
  } catch (error: unknown) {
    return rejectWithValue(customerErrorMessage(error));
  }
});

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomerSearch: state => {
      state.searchHits = [];
      state.searchError = null;
      state.searchLoading = false;
      state.pendingSearch = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(searchCustomersByQuery.pending, (state, action) => {
        state.searchLoading = true;
        state.searchError = null;
        state.pendingSearch = action.meta.arg.trim();
      })
      .addCase(searchCustomersByQuery.fulfilled, (state, action) => {
        if (
          state.pendingSearch === null ||
          action.meta.arg.trim() !== state.pendingSearch
        ) {
          return;
        }
        state.searchLoading = false;
        state.searchHits = action.payload.customers;
        state.searchError = null;
      })
      .addCase(searchCustomersByQuery.rejected, (state, action) => {
        if (action.meta.aborted) {
          return;
        }
        if (
          state.pendingSearch === null ||
          action.meta.arg.trim() !== state.pendingSearch
        ) {
          return;
        }
        state.searchLoading = false;
        state.searchHits = [];
        state.searchError =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tìm được khách hàng';
      })
      .addCase(logout.fulfilled, () => ({ ...initialState }))
      .addCase(logout.rejected, () => ({ ...initialState }));
  },
});

export const { clearCustomerSearch } = customerSlice.actions;
export default customerSlice.reducer;
