import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { markDirectoryFetchPending, markDirectoryFetchSettled, markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { isAxiosError } from 'axios';
import { logout } from '@services/auth/authSlice';
import {
  getShopDirectory,
  getShopList,
  getShopsForSalesMenu,
  removeCurrentWarehouse,
  switchCurrentWarehouse,
  type ShopListResult,
} from './shopAPI';
import type { ShopListItem, ShopListPaginationMeta } from './shopResponseTypes';

/** Sá»‘ item tá»‘i \u0111a giá»¯ trong bá»™ nhá»› Redux (sliding window). */
export const SHOP_DIRECTORY_MAX_WINDOW = 100;

const shopErrorMessage = (error: unknown): string => {
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

export type FetchShopDirectoryArg = {
  page: number;
  per_page: number;
  search?: string;
  platform?: string | null;
  /** `all` = khĂ´ng gá»­i filter[is_active]. */
  status: 'all' | 'active' | 'inactive';
  append?: boolean;
};

interface ShopState {
  shops: ShopListItem[];
  meta: ShopListPaginationMeta | null;
  loading: boolean;
  error: string | null;
  /** GET /shops â€” menu Ban hang (khac shop-context). */
  menuShops: ShopListItem[];
  menuMeta: ShopListPaginationMeta | null;
  menuLoading: boolean;
  menuError: string | null;
  /** CĂ i \u0111áº·t â†’ Cá»­a hĂ ng â€” danh sĂ¡ch phĂ¢n trang. */
  directoryItems: ShopListItem[];
  directoryMeta: ShopListPaginationMeta | null;
  directoryLoading: boolean;
  directoryRefreshing: boolean;
  directoryError: string | null;
  directoryLoadingMore: boolean;
  directoryWindowStart: number;
}

const initialState: ShopState = {
  shops: [],
  meta: null,
  loading: false,
  error: null,
  menuShops: [],
  menuMeta: null,
  menuLoading: false,
  menuError: null,
  directoryItems: [],
  directoryMeta: null,
  directoryLoading: false,
  directoryRefreshing: false,
  directoryError: null,
  directoryLoadingMore: false,
  directoryWindowStart: 0,
};

export const fetchShopList = createAsyncThunk<
  ShopListResult,
  void,
  { rejectValue: string }
>('shop/fetchShopList', async (_, { rejectWithValue }) => {
  try {
    return await getShopList();
  } catch (error: unknown) {
    return rejectWithValue(shopErrorMessage(error));
  }
});

export const fetchSalesMenuShops = createAsyncThunk<
  ShopListResult,
  void,
  { rejectValue: string }
>('shop/fetchSalesMenuShops', async (_, { rejectWithValue }) => {
  try {
    return await getShopsForSalesMenu();
  } catch (error: unknown) {
    return rejectWithValue(shopErrorMessage(error));
  }
});

export const fetchShopDirectory = createAsyncThunk<
  ShopListResult & { append: boolean },
  FetchShopDirectoryArg,
  { rejectValue: string }
>('shop/fetchShopDirectory', async (arg, { rejectWithValue }) => {
  try {
    const isActive =
      arg.status === 'all' ? undefined : arg.status === 'active' ? true : false;
    const result = await getShopDirectory({
      page: arg.page,
      per_page: arg.per_page,
      search: arg.search,
      platform: arg.platform ?? undefined,
      isActive,
    });
    return { ...result, append: arg.append === true };
  } catch (error: unknown) {
    return rejectWithValue(shopErrorMessage(error));
  }
});

export const switchShopContextWarehouse = createAsyncThunk<
  ShopListResult,
  number,
  { rejectValue: string }
>(
  'shop/switchShopContextWarehouse',
  async (warehouseId, { rejectWithValue }) => {
    try {
      return await switchCurrentWarehouse(warehouseId);
    } catch (error: unknown) {
      return rejectWithValue(shopErrorMessage(error));
    }
  },
);

export const clearShopWarehouseContext = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('shop/clearShopWarehouseContext', async (_, { rejectWithValue }) => {
  try {
    return await removeCurrentWarehouse();
  } catch (error: unknown) {
    return rejectWithValue(shopErrorMessage(error));
  }
});

const applyShopListResult = (state: ShopState, payload: ShopListResult) => {
  state.shops = payload.shops;
  state.meta = payload.meta;
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearShopError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchShopList.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchShopList.fulfilled,
        (state, action: PayloadAction<ShopListResult>) => {
          state.loading = false;
          applyShopListResult(state, action.payload);
        },
      )
      .addCase(fetchShopList.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Khong the tai danh sach shop';
      })
      .addCase(fetchSalesMenuShops.pending, state => {
        state.menuLoading = true;
        state.menuError = null;
      })
      .addCase(
        fetchSalesMenuShops.fulfilled,
        (state, action: PayloadAction<ShopListResult>) => {
          state.menuLoading = false;
          state.menuShops = action.payload.shops;
          state.menuMeta = action.payload.meta;
        },
      )
      .addCase(fetchSalesMenuShops.rejected, (state, action) => {
        state.menuLoading = false;
        state.menuError =
          typeof action.payload === 'string'
            ? action.payload
            : 'Khong the tai danh sach menu';
      })
      .addCase(fetchShopDirectory.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.directoryLoadingMore = true;
        } else {
          markDirectoryFetchPending(state);
        }
      })
      .addCase(
        fetchShopDirectory.fulfilled,
        (state, action: PayloadAction<ShopListResult & { append: boolean }>) => {
          state.directoryLoading = false;
          state.directoryRefreshing = false;
          state.directoryLoadingMore = false;
          state.directoryMeta = action.payload.meta;
          if (action.payload.append) {
            const MAX = SHOP_DIRECTORY_MAX_WINDOW;
            const combined = [...state.directoryItems, ...action.payload.shops];
            if (combined.length > MAX) {
              const dropped = combined.length - MAX;
              state.directoryItems = combined.slice(dropped);
              state.directoryWindowStart += dropped;
            } else {
              state.directoryItems = combined;
            }
          } else {
            state.directoryItems = action.payload.shops;
            state.directoryWindowStart = 0;
          }
        },
      )
      .addCase(fetchShopDirectory.rejected, (state, action) => {
        state.directoryLoading = false;
        state.directoryRefreshing = false;
        state.directoryLoadingMore = false;
        state.directoryError =
          typeof action.payload === 'string'
            ? action.payload
            : 'Khong the tai danh sach shop';
        state.directoryItems = [];
        state.directoryMeta = null;
      })
      .addCase(switchShopContextWarehouse.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        switchShopContextWarehouse.fulfilled,
        (state, action: PayloadAction<ShopListResult>) => {
          state.loading = false;
          applyShopListResult(state, action.payload);
        },
      )
      .addCase(switchShopContextWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Khong the chuyen shop context';
      })
      .addCase(clearShopWarehouseContext.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearShopWarehouseContext.fulfilled, state => {
        state.loading = false;
        state.shops = [];
        state.meta = null;
      })
      .addCase(clearShopWarehouseContext.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Khong the xoa warehouse context';
      })
      .addCase(logout.fulfilled, state => {
        state.shops = [];
        state.meta = null;
        state.error = null;
        state.loading = false;
        state.menuShops = [];
        state.menuMeta = null;
        state.menuError = null;
        state.menuLoading = false;
        state.directoryItems = [];
        state.directoryMeta = null;
        state.directoryError = null;
        state.directoryLoading = false;
        state.directoryRefreshing = false;
        state.directoryLoadingMore = false;
        state.directoryWindowStart = 0;
      })
      .addCase(logout.rejected, state => {
        state.shops = [];
        state.meta = null;
        state.error = null;
        state.loading = false;
        state.menuShops = [];
        state.menuMeta = null;
        state.menuError = null;
        state.menuLoading = false;
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

export const { clearShopError } = shopSlice.actions;
export default shopSlice.reducer;

