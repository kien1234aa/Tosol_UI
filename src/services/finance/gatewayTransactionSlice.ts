import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { logout } from '@services/auth/authSlice';
import type {
  GatewayTxnListFilter,
  GatewayTxnListTypeFilter,
} from '@features/finance/gatewayTransaction/gatewayTransactionListTypes';
import { getGatewayTransactionsList } from './gatewayTransactionAPI';
import {
  gatewayTxnListExtraFiltersForApi,
  gatewayTxnListFilterToApiStatus,
} from '@mappers/finance/gatewayTransactionListMappers';
import type {
  GatewayTransactionsListMeta,
  PaymentGatewayTransactionListItemApi,
} from './gatewayTransactionApiTypes';

export const GATEWAY_TXN_LIST_MAX_WINDOW = 100;

export type GatewayTxnCountsState = {
  pending: number | null;
  processing: number | null;
  completed: number | null;
  failed: number | null;
};

export type GatewayTransactionListState = {
  items: PaymentGatewayTransactionListItemApi[];
  meta: GatewayTransactionsListMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  windowStart: number;
  error: string | null;
  listFilter: GatewayTxnListFilter;
  /** `filter[seller_id]` — rỗng = tất cả. */
  listSellerId: string;
  listTypeFilter: GatewayTxnListTypeFilter;
  listDateFrom: string;
  listDateTo: string;
  listPage: number;
  listPerPage: number;
  listSearch: string;
  counts: GatewayTxnCountsState;
  countsLoading: boolean;
};

const initialState: GatewayTransactionListState = {
  items: [],
  meta: null,
  loading: false,
  refreshing: false,
  loadingMore: false,
  windowStart: 0,
  error: null,
  listFilter: 'all',
  listSellerId: '',
  listTypeFilter: 'all',
  listDateFrom: '',
  listDateTo: '',
  listPage: 1,
  listPerPage: 10,
  listSearch: '',
  counts: {
    pending: null,
    processing: null,
    completed: null,
    failed: null,
  },
  countsLoading: false,
};

export const fetchGatewayTransactions = createAsyncThunk(
  'gatewayTransaction/fetchList',
  async (
    arg: { page?: number; per_page?: number; append?: boolean } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as {
        gatewayTransaction: GatewayTransactionListState;
      };
      const s = state.gatewayTransaction;
      const page = arg?.page ?? s.listPage;
      const per_page = arg?.per_page ?? s.listPerPage;
      const filterStatus = gatewayTxnListFilterToApiStatus(s.listFilter);
      const extra = gatewayTxnListExtraFiltersForApi({
        sellerId: s.listSellerId,
        typeFilter: s.listTypeFilter,
        dateFrom: s.listDateFrom,
        dateTo: s.listDateTo,
      });
      const res = await getGatewayTransactionsList({
        page,
        per_page,
        filterStatus,
        search: s.listSearch || undefined,
        ...extra,
      });
      if (!res.success) {
        return rejectWithValue(res.message ?? 'Không tải được giao dịch cổng');
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
          : 'Không tải được giao dịch cổng';
      return rejectWithValue(msg);
    }
  },
);

export const fetchGatewayTxnCounts = createAsyncThunk(
  'gatewayTransaction/fetchCounts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const s = (
        getState() as { gatewayTransaction: GatewayTransactionListState }
      ).gatewayTransaction;
      const extra = gatewayTxnListExtraFiltersForApi({
        sellerId: s.listSellerId,
        typeFilter: s.listTypeFilter,
        dateFrom: s.listDateFrom,
        dateTo: s.listDateTo,
      });
      const base = {
        page: 1,
        per_page: 1,
        skipInclude: true,
        skipSort: true,
        ...extra,
      };
      const [pendingRes, processingRes, completedRes, failedRes] =
        await Promise.all([
          getGatewayTransactionsList({ ...base, filterStatus: 'pending' }),
          getGatewayTransactionsList({ ...base, filterStatus: 'processing' }),
          getGatewayTransactionsList({ ...base, filterStatus: 'completed' }),
          getGatewayTransactionsList({ ...base, filterStatus: 'failed' }),
        ]);

      const pickTotal = (
        r: Awaited<ReturnType<typeof getGatewayTransactionsList>>,
      ) => (r.success && r.meta ? r.meta.total : 0);

      return {
        pending: pickTotal(pendingRes),
        processing: pickTotal(processingRes),
        completed: pickTotal(completedRes),
        failed: pickTotal(failedRes),
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được thống kê';
      return rejectWithValue(msg);
    }
  },
);

const gatewayTransactionSlice = createSlice({
  name: 'gatewayTransaction',
  initialState,
  reducers: {
    setGatewayTxnListFilter: (
      state,
      action: PayloadAction<GatewayTxnListFilter>,
    ) => {
      state.listFilter = action.payload;
      state.listPage = 1;
    },
    setGatewayTxnListSearch: (state, action: PayloadAction<string>) => {
      state.listSearch = action.payload;
      state.listPage = 1;
    },
    clearGatewayTxnListFilter: state => {
      state.listFilter = 'all';
      state.listSellerId = '';
      state.listTypeFilter = 'all';
      state.listDateFrom = '';
      state.listDateTo = '';
      state.listPage = 1;
    },
    setGatewayTxnListExtraFilters: (
      state,
      action: PayloadAction<{
        sellerId: string;
        typeFilter: GatewayTxnListTypeFilter;
        dateFrom: string;
        dateTo: string;
      }>,
    ) => {
      state.listSellerId = action.payload.sellerId.trim();
      state.listTypeFilter = action.payload.typeFilter;
      state.listDateFrom = action.payload.dateFrom.trim();
      state.listDateTo = action.payload.dateTo.trim();
      state.listPage = 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGatewayTransactions.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.loadingMore = true;
        } else {
          markListFetchPending(state);
        }
      })
      .addCase(fetchGatewayTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        const { items, meta, append } = action.payload;
        if (append) {
          const MAX = GATEWAY_TXN_LIST_MAX_WINDOW;
          const combined = [...state.items, ...items];
          if (combined.length > MAX) {
            const dropped = combined.length - MAX;
            state.items = combined.slice(dropped);
            state.windowStart += dropped;
          } else {
            state.items = combined;
          }
        } else {
          state.items = items;
          state.windowStart = 0;
        }
        state.meta = meta;
        if (meta) {
          state.listPage = meta.current_page;
          state.listPerPage = meta.per_page;
        }
      })
      .addCase(fetchGatewayTransactions.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được giao dịch cổng';
      })
      .addCase(fetchGatewayTxnCounts.pending, state => {
        state.countsLoading = true;
      })
      .addCase(fetchGatewayTxnCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchGatewayTxnCounts.rejected, state => {
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

export const {
  setGatewayTxnListFilter,
  setGatewayTxnListSearch,
  clearGatewayTxnListFilter,
  setGatewayTxnListExtraFilters,
} = gatewayTransactionSlice.actions;
export const gatewayTransactionReducer = gatewayTransactionSlice.reducer;
