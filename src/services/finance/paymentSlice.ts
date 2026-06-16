import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { logout } from '@services/auth/authSlice';
import type {
  PaymentListFilter,
  PaymentListKindFilter,
  PaymentListMethodFilter,
} from '@features/finance/payment/paymentListTypes';
import { getPayments } from './paymentAPI';
import {
  paymentListFilterToApiStatus,
  paymentListRangeFiltersForApi,
  paymentListSideFiltersForApi,
} from '@mappers/finance/paymentListMappers';
import type { PaymentListItemApi, PaymentsListMeta } from './paymentApiTypes';

export const PAYMENT_LIST_MAX_WINDOW = 100;

export type PaymentCountsState = {
  pending: number | null;
  completed: number | null;
  failed: number | null;
  cancelled: number | null;
};

export type PaymentListState = {
  items: PaymentListItemApi[];
  meta: PaymentsListMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  windowStart: number;
  error: string | null;
  listFilter: PaymentListFilter;
  listMethodFilter: PaymentListMethodFilter;
  listKindFilter: PaymentListKindFilter;
  listPage: number;
  listPerPage: number;
  listSearch: string;
  /** Bộ lọc nâng cao — ngày YYYY-MM-DD, chuỗi số tiền (gửi API khi hợp lệ). */
  listDateFrom: string;
  listDateTo: string;
  listAmountFrom: string;
  listAmountTo: string;
  counts: PaymentCountsState;
  countsLoading: boolean;
};

const initialState: PaymentListState = {
  items: [],
  meta: null,
  loading: false,
  refreshing: false,
  loadingMore: false,
  windowStart: 0,
  error: null,
  listFilter: 'all',
  listMethodFilter: 'all',
  listKindFilter: 'all',
  listPage: 1,
  listPerPage: 10,
  listSearch: '',
  listDateFrom: '',
  listDateTo: '',
  listAmountFrom: '',
  listAmountTo: '',
  counts: {
    pending: null,
    completed: null,
    failed: null,
    cancelled: null,
  },
  countsLoading: false,
};

export const fetchPayments = createAsyncThunk(
  'payment/fetchPayments',
  async (
    arg: { page?: number; per_page?: number; append?: boolean } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { payment: PaymentListState };
      const s = state.payment;
      const page = arg?.page ?? s.listPage;
      const per_page = arg?.per_page ?? s.listPerPage;
      const filterStatus = paymentListFilterToApiStatus(s.listFilter);
      const side = paymentListSideFiltersForApi(
        s.listMethodFilter,
        s.listKindFilter,
      );
      const range = paymentListRangeFiltersForApi(
        s.listDateFrom,
        s.listDateTo,
        s.listAmountFrom,
        s.listAmountTo,
      );
      const res = await getPayments({
        page,
        per_page,
        filterStatus,
        search: s.listSearch || undefined,
        ...side,
        ...range,
      });
      if (!res.success) {
        return rejectWithValue(
          res.message ?? 'Không tải được danh sách thanh toán',
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
          : 'Không tải được danh sách thanh toán';
      return rejectWithValue(msg);
    }
  },
);

export const fetchPaymentCounts = createAsyncThunk(
  'payment/fetchPaymentCounts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const s = (getState() as { payment: PaymentListState }).payment;
      const side = paymentListSideFiltersForApi(
        s.listMethodFilter,
        s.listKindFilter,
      );
      const range = paymentListRangeFiltersForApi(
        s.listDateFrom,
        s.listDateTo,
        s.listAmountFrom,
        s.listAmountTo,
      );
      const base = {
        page: 1,
        per_page: 1,
        skipInclude: true as const,
        skipSort: true as const,
        ...side,
        ...range,
      };
      const [pendingRes, completedRes, failedRes, cancelledRes] =
        await Promise.all([
          getPayments({ ...base, filterStatus: 'pending' }),
          getPayments({ ...base, filterStatus: 'completed' }),
          getPayments({ ...base, filterStatus: 'failed' }),
          getPayments({ ...base, filterStatus: 'cancelled' }),
        ]);

      const pickTotal = (r: Awaited<ReturnType<typeof getPayments>>) =>
        r.success && r.meta ? r.meta.total : 0;

      return {
        pending: pickTotal(pendingRes),
        completed: pickTotal(completedRes),
        failed: pickTotal(failedRes),
        cancelled: pickTotal(cancelledRes),
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được thống kê thanh toán';
      return rejectWithValue(msg);
    }
  },
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentListFilter: (state, action: PayloadAction<PaymentListFilter>) => {
      state.listFilter = action.payload;
      state.listPage = 1;
    },
    setPaymentListMethodFilter: (
      state,
      action: PayloadAction<PaymentListMethodFilter>,
    ) => {
      state.listMethodFilter = action.payload;
      state.listPage = 1;
    },
    setPaymentListKindFilter: (
      state,
      action: PayloadAction<PaymentListKindFilter>,
    ) => {
      state.listKindFilter = action.payload;
      state.listPage = 1;
    },
    setPaymentListSearch: (state, action: PayloadAction<string>) => {
      state.listSearch = action.payload;
      state.listPage = 1;
    },
    clearPaymentListFilter: state => {
      state.listFilter = 'all';
      state.listMethodFilter = 'all';
      state.listKindFilter = 'all';
      state.listDateFrom = '';
      state.listDateTo = '';
      state.listAmountFrom = '';
      state.listAmountTo = '';
      state.listPage = 1;
    },
    setPaymentListExtraListFilters: (
      state,
      action: PayloadAction<{
        dateFrom: string;
        dateTo: string;
        amountFrom: string;
        amountTo: string;
      }>,
    ) => {
      state.listDateFrom = action.payload.dateFrom.trim();
      state.listDateTo = action.payload.dateTo.trim();
      state.listAmountFrom = action.payload.amountFrom.trim();
      state.listAmountTo = action.payload.amountTo.trim();
      state.listPage = 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPayments.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.loadingMore = true;
        } else {
          markListFetchPending(state);
        }
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        const { items, meta, append } = action.payload;
        if (append) {
          const MAX = PAYMENT_LIST_MAX_WINDOW;
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
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được danh sách thanh toán';
      })
      .addCase(fetchPaymentCounts.pending, state => {
        state.countsLoading = true;
      })
      .addCase(fetchPaymentCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchPaymentCounts.rejected, state => {
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
  setPaymentListFilter,
  setPaymentListMethodFilter,
  setPaymentListKindFilter,
  setPaymentListSearch,
  clearPaymentListFilter,
  setPaymentListExtraListFilters,
} = paymentSlice.actions;
export const paymentReducer = paymentSlice.reducer;
