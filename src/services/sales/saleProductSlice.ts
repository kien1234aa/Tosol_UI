import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import { fetchProductSuggestions } from './saleProductAPI';
import type { ShopProductRow } from './saleProductApiTypes';

const productErrorMessage = (error: unknown): string => {
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
  return 'Không tải được gợi ý sản phẩm';
};

export type FetchProductSuggestionsArg = {
  shopId: number;
  search: string;
};

type PendingSuggestions = { shopId: number; search: string };

type ProductState = {
  suggestions: ShopProductRow[];
  suggestionsLoading: boolean;
  suggestionsError: string | null;
  pendingSuggestions: PendingSuggestions | null;
};

const initialState: ProductState = {
  suggestions: [],
  suggestionsLoading: false,
  suggestionsError: null,
  pendingSuggestions: null,
};

/** GET /products/suggestions — dùng `signal` để hủy khi thunk bị abort. */
export const fetchProductSuggestionsThunk = createAsyncThunk<
  { items: ShopProductRow[] },
  FetchProductSuggestionsArg,
  { rejectValue: string }
>(
  'product/fetchSuggestions',
  async ({ shopId, search }, { rejectWithValue, signal }) => {
    try {
      const items = await fetchProductSuggestions({
        shopId,
        search,
        signal,
      });
      return { items };
    } catch (error: unknown) {
      return rejectWithValue(productErrorMessage(error));
    }
  },
  {
    condition: ({ shopId }) => shopId > 0,
  },
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductSuggestions: state => {
      state.suggestions = [];
      state.suggestionsError = null;
      state.suggestionsLoading = false;
      state.pendingSuggestions = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProductSuggestionsThunk.pending, (state, action) => {
        state.suggestionsLoading = true;
        state.suggestionsError = null;
        const { shopId, search } = action.meta.arg;
        state.pendingSuggestions = {
          shopId,
          search: search.trim(),
        };
      })
      .addCase(fetchProductSuggestionsThunk.fulfilled, (state, action) => {
        const { shopId, search } = action.meta.arg;
        const pending = state.pendingSuggestions;
        if (
          pending === null ||
          pending.shopId !== shopId ||
          pending.search !== search.trim()
        ) {
          return;
        }
        state.suggestionsLoading = false;
        state.suggestions = action.payload.items;
        state.suggestionsError = null;
      })
      .addCase(fetchProductSuggestionsThunk.rejected, (state, action) => {
        if (action.meta.aborted) {
          return;
        }
        const { shopId, search } = action.meta.arg;
        const pending = state.pendingSuggestions;
        if (
          pending === null ||
          pending.shopId !== shopId ||
          pending.search !== search.trim()
        ) {
          return;
        }
        state.suggestionsLoading = false;
        state.suggestions = [];
        state.suggestionsError =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được gợi ý sản phẩm';
      })
      .addCase(logout.fulfilled, () => ({ ...initialState }))
      .addCase(logout.rejected, () => ({ ...initialState }));
  },
});

export const { clearProductSuggestions } = productSlice.actions;
export default productSlice.reducer;
