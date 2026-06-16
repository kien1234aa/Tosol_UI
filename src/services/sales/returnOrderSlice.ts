import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { logout } from '@services/auth/authSlice';
import { getReturnOrders } from './returnOrderAPI';
import {
  EMPTY_RETURN_ORDER_LIST_FILTERS,
  type ReturnOrderListFilters,
} from './returnOrderAPI';
import type {
  ReturnOrderRecord,
  ReturnOrdersListMeta,
} from './returnOrderApiTypes';

export type ReturnOrderCountsState = {
  pending: number | null;
  receiving: number | null;
  completed: number | null;
  cancelled: number | null;
};

export type ReturnOrderListState = {
  items: ReturnOrderRecord[];
  meta: ReturnOrdersListMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  listFilters: ReturnOrderListFilters;
  listPage: number;
  listPerPage: number;
  windowStart: number;
  counts: ReturnOrderCountsState;
  countsLoading: boolean;
};

const emptyFilters: ReturnOrderListFilters = {
  ...EMPTY_RETURN_ORDER_LIST_FILTERS,
};

export const RETURN_ORDER_LIST_MAX_WINDOW = 100;

const initialState: ReturnOrderListState = {
  items: [],
  meta: null,
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  listFilters: emptyFilters,
  listPage: 1,
  listPerPage: 15,
  windowStart: 0,
  counts: {
    pending: null,
    receiving: null,
    completed: null,
    cancelled: null,
  },
  countsLoading: false,
};

export const fetchReturnOrders = createAsyncThunk(
  'returnOrder/fetchReturnOrders',
  async (
    arg: { page?: number; per_page?: number; append?: boolean } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { returnOrder: ReturnOrderListState };
      const filters = state.returnOrder.listFilters;
      const hasServerFilters = Boolean(
        filters.filterStatus?.trim() ||
          filters.filterReturnType?.trim() ||
          filters.filterReason?.trim() ||
          filters.filterRefundStatus?.trim() ||
          filters.filterDateFrom?.trim() ||
          filters.filterDateTo?.trim() ||
          filters.filterSearch?.trim(),
      );
      const page = arg?.page ?? state.returnOrder.listPage;
      const per_page = arg?.per_page ?? state.returnOrder.listPerPage;
      const res = await getReturnOrders({
        page,
        per_page,
        filters: hasServerFilters ? filters : undefined,
      });
      if (!res.success) {
        return rejectWithValue(res.message ?? 'Không tải được đơn trả hàng');
      }
      if (res.meta == null) {
        return rejectWithValue('Không tải được đơn trả hàng');
      }
      return {
        items: res.data ?? [],
        meta: res.meta,
        append: arg?.append === true,
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được đơn trả hàng';
      return rejectWithValue(msg);
    }
  },
);

export const fetchReturnOrderCounts = createAsyncThunk(
  'returnOrder/fetchReturnOrderCounts',
  async (_, { rejectWithValue }) => {
    try {
      const [pendingRes, receivingRes, completedRes, cancelledRes] =
        await Promise.all([
          getReturnOrders({
            page: 1,
            per_page: 1,
            filters: { filterStatus: 'pending' },
          }),
          getReturnOrders({
            page: 1,
            per_page: 1,
            filters: { filterStatus: 'receiving' },
          }),
          getReturnOrders({
            page: 1,
            per_page: 1,
            filters: { filterStatus: 'completed' },
          }),
          getReturnOrders({
            page: 1,
            per_page: 1,
            filters: { filterStatus: 'cancelled' },
          }),
        ]);

      const pickTotal = (r: Awaited<ReturnType<typeof getReturnOrders>>) =>
        r.success && r.meta ? r.meta.total : 0;

      return {
        pending: pickTotal(pendingRes),
        receiving: pickTotal(receivingRes),
        completed: pickTotal(completedRes),
        cancelled: pickTotal(cancelledRes),
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được thống kê đơn trả';
      return rejectWithValue(msg);
    }
  },
);

const returnOrderSlice = createSlice({
  name: 'returnOrder',
  initialState,
  reducers: {
    setReturnOrderListFilters: (
      state,
      action: PayloadAction<ReturnOrderListFilters>,
    ) => {
      state.listFilters = { ...action.payload };
    },
    clearReturnOrderListFilters: state => {
      state.listFilters = emptyFilters;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchReturnOrders.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.loadingMore = true;
        } else {
          state.error = null;
          if (state.items.length === 0) {
            state.loading = true;
          } else {
            state.refreshing = true;
          }
        }
      })
      .addCase(fetchReturnOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        if (action.payload.append) {
          const MAX = RETURN_ORDER_LIST_MAX_WINDOW;
          const combined = [...state.items, ...action.payload.items];
          if (combined.length > MAX) {
            const dropped = combined.length - MAX;
            state.items = combined.slice(dropped);
            state.windowStart += dropped;
          } else {
            state.items = combined;
          }
        } else {
          state.items = action.payload.items;
          state.windowStart = 0;
        }
        state.meta = action.payload.meta;
        const m = action.payload.meta;
        state.listPage = m.current_page;
        state.listPerPage = m.per_page;
      })
      .addCase(fetchReturnOrders.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được đơn trả hàng';
      })
      .addCase(fetchReturnOrderCounts.pending, state => {
        state.countsLoading = true;
      })
      .addCase(fetchReturnOrderCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchReturnOrderCounts.rejected, state => {
        state.countsLoading = false;
      })
      .addCase(logout.fulfilled, state => {
        Object.assign(state, initialState);
      })
      .addCase(logout.rejected, state => {
        Object.assign(state, initialState);
      });
  },
});

export const { setReturnOrderListFilters, clearReturnOrderListFilters } =
  returnOrderSlice.actions;
export const returnOrderReducer = returnOrderSlice.reducer;
