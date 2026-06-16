import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { EMPTY_SALE_ORDER_LIST_FILTERS, getSaleOrders } from './orderAPI';
import type { SaleOrderListFilters } from './orderAPI';
import type { SaleOrder, SaleOrdersMeta } from './saleOrderApiTypes';
import { logout } from '@services/auth/authSlice';

/** Số item tối đa giữ trong bộ nhớ Redux (sliding window). */
export const ORDER_LIST_MAX_WINDOW = 100;

export type OrderCountsState = {
  pending: number | null;
  processing: number | null;
  delivered: number | null;
  hasIssue: number | null;
};

export type OrderListState = {
  items: SaleOrder[];
  meta: SaleOrdersMeta | null;
  loading: boolean;
  /** Refetch khi đã có list — không bật `loading` (tránh lag re-render). */
  refreshing: boolean;
  /** Đang tải thêm trang tiếp theo (infinite scroll). */
  loadingMore: boolean;
  error: string | null;
  /** `null` = không lọc (vd. "Tất cả đơn hàng"); số = `filter[shop_id]` theo cửa hàng. */
  listShopId: number | null;
  /** Bộ lọc đang áp dụng cho danh sách (đồng bộ query API). */
  listFilters: SaleOrderListFilters;
  /** Trang & page size danh sách (đồng bộ API). */
  listPage: number;
  listPerPage: number;
  /**
   * Số item đã bị loại khỏi đầu mảng do sliding window.
   * Dùng để hiển thị "Đang hiển thị item X–Y trong tổng Z".
   */
  windowStart: number;
  counts: OrderCountsState;
  countsLoading: boolean;
};

const initialState: OrderListState = {
  items: [],
  meta: null,
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  listShopId: null,
  listFilters: EMPTY_SALE_ORDER_LIST_FILTERS,
  listPage: 1,
  listPerPage: 15,
  windowStart: 0,
  counts: {
    pending: null,
    processing: null,
    delivered: null,
    hasIssue: null,
  },
  countsLoading: false,
};

export const fetchSaleOrders = createAsyncThunk(
  'order/fetchSaleOrders',
  async (
    arg: { page?: number; per_page?: number; append?: boolean } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { order: OrderListState };
      const filters = state.order.listFilters;
      const shopId = state.order.listShopId;
      const hasServerFilters =
        Boolean(filters.filterSearch?.trim()) ||
        Boolean(filters.filterStatus?.trim()) ||
        filters.filterHasIssue === true ||
        filters.filterHasIssue === false ||
        Boolean(filters.filterPaymentStatus?.trim()) ||
        Boolean(filters.filterDateFrom?.trim()) ||
        Boolean(filters.filterDateTo?.trim());
      const page = arg?.page ?? state.order.listPage;
      const per_page = arg?.per_page ?? state.order.listPerPage;
      const res = await getSaleOrders({
        page,
        per_page,
        shopId: shopId ?? undefined,
        filters: hasServerFilters ? filters : undefined,
      });
      if (!res.success) {
        return rejectWithValue(res.message ?? 'Không tải được đơn hàng');
      }
      return {
        items: res.data ?? [],
        meta: res.meta ?? null,
        append: arg?.append === true,
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được đơn hàng';
      return rejectWithValue(msg);
    }
  },
);

/** Chỉ lấy meta.total (per_page=1) cho từng ô thống kê. */
export const fetchOrderCounts = createAsyncThunk(
  'order/fetchOrderCounts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { order: OrderListState };
      const shopId = state.order.listShopId ?? undefined;
      const [pendingRes, processingRes, deliveredRes, issueRes] =
        await Promise.all([
          getSaleOrders({
            page: 1,
            per_page: 1,
            shopId,
            filters: { filterStatus: 'pending' },
          }),
          getSaleOrders({
            page: 1,
            per_page: 1,
            shopId,
            filters: { filterStatus: 'confirmed,packing' },
          }),
          getSaleOrders({
            page: 1,
            per_page: 1,
            shopId,
            filters: { filterStatus: 'delivered' },
          }),
          getSaleOrders({
            page: 1,
            per_page: 1,
            shopId,
            filters: { filterHasIssue: true },
          }),
        ]);

      const pickTotal = (r: Awaited<ReturnType<typeof getSaleOrders>>) =>
        r.success && r.meta ? r.meta.total : 0;

      return {
        pending: pickTotal(pendingRes),
        processing: pickTotal(processingRes),
        delivered: pickTotal(deliveredRes),
        hasIssue: pickTotal(issueRes),
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được thống kê đơn';
      return rejectWithValue(msg);
    }
  },
);

const logoutDefaults = {
  items: [] as SaleOrder[],
  meta: null,
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  listShopId: null as null,
  listFilters: EMPTY_SALE_ORDER_LIST_FILTERS,
  listPage: 1,
  listPerPage: 15,
  windowStart: 0,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderListShopId: (state, action: PayloadAction<number | null>) => {
      state.listShopId = action.payload;
    },
    setOrderListFilters: (
      state,
      action: PayloadAction<SaleOrderListFilters>,
    ) => {
      state.listFilters = { ...action.payload };
    },
    clearOrderListFilters: state => {
      state.listFilters = { ...EMPTY_SALE_ORDER_LIST_FILTERS };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSaleOrders.pending, (state, action) => {
        state.error = null;
        if (action.meta.arg?.append === true) {
          state.loadingMore = true;
        } else if (state.items.length === 0) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
      })
      .addCase(fetchSaleOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.meta = action.payload.meta;
        const m = action.payload.meta;
        if (m) {
          state.listPage = m.current_page;
          state.listPerPage = m.per_page;
        }
        if (action.payload.append) {
          const combined = [...state.items, ...action.payload.items];
          if (combined.length > ORDER_LIST_MAX_WINDOW) {
            const dropped = combined.length - ORDER_LIST_MAX_WINDOW;
            state.items = combined.slice(dropped);
            state.windowStart += dropped;
          } else {
            state.items = combined;
          }
        } else {
          state.items = action.payload.items;
          state.windowStart = 0;
        }
      })
      .addCase(fetchSaleOrders.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được đơn hàng';
      })
      .addCase(fetchOrderCounts.pending, state => {
        state.countsLoading = true;
      })
      .addCase(fetchOrderCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchOrderCounts.rejected, state => {
        state.countsLoading = false;
      })
      .addCase(logout.fulfilled, state => {
        Object.assign(state, logoutDefaults);
        state.counts = initialState.counts;
        state.countsLoading = false;
      })
      .addCase(logout.rejected, state => {
        Object.assign(state, logoutDefaults);
        state.counts = initialState.counts;
        state.countsLoading = false;
      });
  },
});

export const {
  setOrderListShopId,
  setOrderListFilters,
  clearOrderListFilters,
} = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
