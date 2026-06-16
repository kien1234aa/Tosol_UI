import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { markListFetchPending, markListFetchSettled } from '@features/listLoading/listFetchSliceHelpers';
import { logout } from '@services/auth/authSlice';
import type { InvoiceListFilter } from '@features/finance/bill/invoiceListTypes';
import { getInvoices } from './invoiceAPI';
import { invoiceListFilterToApiStatus } from '@mappers/finance/invoiceListMappers';
import type { InvoiceApi, InvoicesListMeta } from './invoiceApiTypes';

export const INVOICE_LIST_MAX_WINDOW = 100;

export type InvoiceCountsState = {
  pending: number | null;
  partial: number | null;
  paid: number | null;
  overdue: number | null;
};

export type InvoiceListState = {
  items: InvoiceApi[];
  meta: InvoicesListMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  windowStart: number;
  error: string | null;
  listFilter: InvoiceListFilter;
  listPage: number;
  listPerPage: number;
  listSearch: string;
  counts: InvoiceCountsState;
  countsLoading: boolean;
};

const initialState: InvoiceListState = {
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
    pending: null,
    partial: null,
    paid: null,
    overdue: null,
  },
  countsLoading: false,
};

export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (
    arg: { page?: number; per_page?: number; append?: boolean } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { invoice: InvoiceListState };
      const s = state.invoice;
      const page = arg?.page ?? s.listPage;
      const per_page = arg?.per_page ?? s.listPerPage;
      const filterStatus = invoiceListFilterToApiStatus(s.listFilter);
      const res = await getInvoices({
        page,
        per_page,
        filterStatus,
        search: s.listSearch || undefined,
      });
      if (!res.success) {
        return rejectWithValue(
          res.message ?? 'Không tải được danh sách hóa đơn',
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
          : 'Không tải được danh sách hóa đơn';
      return rejectWithValue(msg);
    }
  },
);

/** Lấy `meta.total` (per_page=1) cho từng trạng thái thống kê. */
export const fetchInvoiceCounts = createAsyncThunk(
  'invoice/fetchInvoiceCounts',
  async (_, { rejectWithValue }) => {
    try {
      const [pendingRes, partialRes, paidRes, overdueRes] = await Promise.all([
        getInvoices({ page: 1, per_page: 1, filterStatus: 'pending' }),
        getInvoices({ page: 1, per_page: 1, filterStatus: 'partially_paid' }),
        getInvoices({ page: 1, per_page: 1, filterStatus: 'paid' }),
        getInvoices({ page: 1, per_page: 1, filterStatus: 'overdue' }),
      ]);

      const pickTotal = (r: Awaited<ReturnType<typeof getInvoices>>) =>
        r.success && r.meta ? r.meta.total : 0;

      return {
        pending: pickTotal(pendingRes),
        partial: pickTotal(partialRes),
        paid: pickTotal(paidRes),
        overdue: pickTotal(overdueRes),
      };
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Không tải được thống kê hóa đơn';
      return rejectWithValue(msg);
    }
  },
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setInvoiceListFilter: (state, action: PayloadAction<InvoiceListFilter>) => {
      state.listFilter = action.payload;
      state.listPage = 1;
    },
    setInvoiceListSearch: (state, action: PayloadAction<string>) => {
      state.listSearch = action.payload;
      state.listPage = 1;
    },
    clearInvoiceListFilter: state => {
      state.listFilter = 'all';
      state.listPage = 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchInvoices.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.loadingMore = true;
        } else {
          markListFetchPending(state);
        }
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        const { items, meta, append } = action.payload;
        if (append) {
          const MAX = INVOICE_LIST_MAX_WINDOW;
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
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được danh sách hóa đơn';
      })
      .addCase(fetchInvoiceCounts.pending, state => {
        state.countsLoading = true;
      })
      .addCase(fetchInvoiceCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchInvoiceCounts.rejected, state => {
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
        state.counts = {
          pending: null,
          partial: null,
          paid: null,
          overdue: null,
        };
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
        state.counts = {
          pending: null,
          partial: null,
          paid: null,
          overdue: null,
        };
        state.countsLoading = false;
      });
  },
});

export const {
  setInvoiceListFilter,
  setInvoiceListSearch,
  clearInvoiceListFilter,
} = invoiceSlice.actions;
export const invoiceReducer = invoiceSlice.reducer;
