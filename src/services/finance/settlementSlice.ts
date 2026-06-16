import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { logout } from '@services/auth/authSlice';
import type { SettlementListFilter } from '@features/finance/settlement/settlementListTypes';
import { getSettlements } from './settlementAPI';
import { settlementListFilterToApiStatus } from '@mappers/finance/settlementListMappers';
import type { SettlementApi, SettlementsListMeta } from './settlementApiTypes';

export const SETTLEMENT_LIST_MAX_WINDOW = 100;

export type SettlementCountsState = {
  draft: number | null;
  confirmed: number | null;
  settled: number | null;
  cancelled: number | null;
};

export type SettlementListState = {
  items: SettlementApi[];
  meta: SettlementsListMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  windowStart: number;
  error: string | null;
  listFilter: SettlementListFilter;
  listPage: number;
  listPerPage: number;
  listSearch: string;
  counts: SettlementCountsState;
  countsLoading: boolean;
};

const initialState: SettlementListState = {
  items: [],
  meta: null,
  loading: false,
  refreshing: false,
  loadingMore: false,
  windowStart: 0,
  error: null,
  listFilter: 'all',
  listPage: 1,
  listPerPage: 10,
  listSearch: '',
  counts: {
    draft: null,
    confirmed: null,
    settled: null,
    cancelled: null,
  },
  countsLoading: false,
};

export const fetchSettlements = createAsyncThunk(
  'settlement/fetchSettlements',
  async (
    arg: { page?: number; per_page?: number; append?: boolean } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { settlement: SettlementListState };
      const s = state.settlement;
      const page = arg?.page ?? s.listPage;
      const per_page = arg?.per_page ?? s.listPerPage;
      const filterStatus = settlementListFilterToApiStatus(s.listFilter);
      const res = await getSettlements({
        page,
        per_page,
        filterStatus,
        search: s.listSearch || undefined,
      });
      if (!res.success) {
        return rejectWithValue(
          res.message ?? 'Không tải được danh sách đối soát',
        );
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
          : 'Không tải được danh sách đối soát';
      return rejectWithValue(msg);
    }
  },
);

export const fetchSettlementCounts = createAsyncThunk(
  'settlement/fetchSettlementCounts',
  async (_, { rejectWithValue }) => {
    try {
      const [draftRes, confirmedRes, settledRes, cancelledRes] =
        await Promise.all([
          getSettlements({ page: 1, per_page: 1, filterStatus: 'draft' }),
          getSettlements({ page: 1, per_page: 1, filterStatus: 'confirmed' }),
          getSettlements({ page: 1, per_page: 1, filterStatus: 'settled' }),
          getSettlements({ page: 1, per_page: 1, filterStatus: 'cancelled' }),
        ]);

      const pickTotal = (r: Awaited<ReturnType<typeof getSettlements>>) =>
        r.success && r.meta ? r.meta.total : 0;

      return {
        draft: pickTotal(draftRes),
        confirmed: pickTotal(confirmedRes),
        settled: pickTotal(settledRes),
        cancelled: pickTotal(cancelledRes),
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được thống kê đối soát';
      return rejectWithValue(msg);
    }
  },
);

const settlementSlice = createSlice({
  name: 'settlement',
  initialState,
  reducers: {
    setSettlementListFilter: (
      state,
      action: PayloadAction<SettlementListFilter>,
    ) => {
      state.listFilter = action.payload;
      state.listPage = 1;
    },
    setSettlementListSearch: (state, action: PayloadAction<string>) => {
      state.listSearch = action.payload;
      state.listPage = 1;
    },
    clearSettlementListFilter: state => {
      state.listFilter = 'all';
      state.listPage = 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSettlements.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.loadingMore = true;
        } else {
          markListFetchPending(state);
        }
      })
      .addCase(fetchSettlements.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        const { items, meta, append } = action.payload;
        if (append) {
          const MAX = SETTLEMENT_LIST_MAX_WINDOW;
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
      .addCase(fetchSettlements.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được danh sách đối soát';
      })
      .addCase(fetchSettlementCounts.pending, state => {
        state.countsLoading = true;
      })
      .addCase(fetchSettlementCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchSettlementCounts.rejected, state => {
        state.countsLoading = false;
      })
      .addCase(logout.fulfilled, state => {
        state.items = [];
        state.meta = null;
        markListFetchSettled(state);
        state.loadingMore = false;
        state.windowStart = 0;
        state.error = null;
        state.listFilter = 'all';
        state.listPage = 1;
        state.listPerPage = 10;
        state.listSearch = '';
        state.counts = { draft: null, confirmed: null, settled: null, cancelled: null };
        state.countsLoading = false;
      })
      .addCase(logout.rejected, state => {
        state.items = [];
        state.meta = null;
        markListFetchSettled(state);
        state.loadingMore = false;
        state.windowStart = 0;
        state.error = null;
        state.listFilter = 'all';
        state.listPage = 1;
        state.listPerPage = 10;
        state.listSearch = '';
        state.counts = { draft: null, confirmed: null, settled: null, cancelled: null };
        state.countsLoading = false;
      });
  },
});

export const {
  setSettlementListFilter,
  setSettlementListSearch,
  clearSettlementListFilter,
} = settlementSlice.actions;
export const settlementReducer = settlementSlice.reducer;
