import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  markListFetchPending,
  markListFetchSettled,
} from '@features/listLoading/listFetchSliceHelpers';
import { logout } from '@services/auth/authSlice';
import { getShipments, SHIPMENT_FILTER_IN_TRANSIT } from './shipmentAPI';
import type { ShipmentListFilters } from './shipmentAPI';
import type { ShipmentRecord, ShipmentsListMeta } from './shipmentApiTypes';

export type ShipmentCountsState = {
  pending: number | null;
  inTransit: number | null;
  delivered: number | null;
  failedDelivery: number | null;
};

export type ShipmentListState = {
  items: ShipmentRecord[];
  meta: ShipmentsListMeta | null;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  listFilters: ShipmentListFilters;
  listPage: number;
  listPerPage: number;
  windowStart: number;
  counts: ShipmentCountsState;
  countsLoading: boolean;
};

const emptyFilters: ShipmentListFilters = {};

export const SHIPMENT_LIST_MAX_WINDOW = 100;

const initialState: ShipmentListState = {
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
    inTransit: null,
    delivered: null,
    failedDelivery: null,
  },
  countsLoading: false,
};

export const fetchShipments = createAsyncThunk(
  'shipment/fetchShipments',
  async (
    arg: { page?: number; per_page?: number; append?: boolean } | undefined,
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as { shipment: ShipmentListState };
      const filters = state.shipment.listFilters;
      const hasServerFilters =
        Boolean(filters.filterStatus?.trim()) ||
        Boolean(filters.filterShippingPartnerCode?.trim()) ||
        Boolean(filters.filterSearch?.trim());
      const page = arg?.page ?? state.shipment.listPage;
      const per_page = arg?.per_page ?? state.shipment.listPerPage;
      const res = await getShipments({
        page,
        per_page,
        filters: hasServerFilters ? filters : undefined,
      });
      if (!res.success) {
        return rejectWithValue(res.message ?? 'Không tải được vận đơn');
      }
      if (res.meta == null) {
        return rejectWithValue('Không tải được vận đơn');
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
          : 'Không tải được vận đơn';
      return rejectWithValue(msg);
    }
  },
);

function pickShipmentCountFromResult(
  settled: PromiseSettledResult<Awaited<ReturnType<typeof getShipments>>>,
): number {
  if (settled.status !== 'fulfilled') {
    return 0;
  }
  const r = settled.value;
  return r.success && r.meta != null ? r.meta.total : 0;
}

/** Mỗi ô thống kê gọi API riêng — một status không hợp lệ không làm hỏng cả khối. */
export const fetchShipmentCounts = createAsyncThunk(
  'shipment/fetchShipmentCounts',
  async () => {
    const settled = await Promise.allSettled([
      getShipments({
        page: 1,
        per_page: 1,
        filters: { filterStatus: 'pending' },
      }),
      getShipments({
        page: 1,
        per_page: 1,
        filters: { filterStatus: SHIPMENT_FILTER_IN_TRANSIT },
      }),
      getShipments({
        page: 1,
        per_page: 1,
        filters: { filterStatus: 'delivered' },
      }),
      getShipments({
        page: 1,
        per_page: 1,
        filters: { filterStatus: 'failed_delivery' },
      }),
    ]);

    return {
      pending: pickShipmentCountFromResult(settled[0]),
      inTransit: pickShipmentCountFromResult(settled[1]),
      delivered: pickShipmentCountFromResult(settled[2]),
      failedDelivery: pickShipmentCountFromResult(settled[3]),
    };
  },
);

const shipmentSlice = createSlice({
  name: 'shipment',
  initialState,
  reducers: {
    setShipmentListFilters: (
      state,
      action: PayloadAction<ShipmentListFilters>,
    ) => {
      state.listFilters = { ...action.payload };
    },
    clearShipmentListFilters: state => {
      state.listFilters = emptyFilters;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchShipments.pending, (state, action) => {
        if (action.meta.arg?.append === true) {
          state.loadingMore = true;
        } else {
          markListFetchPending(state);
        }
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.loadingMore = false;
        if (action.payload.append) {
          const MAX = SHIPMENT_LIST_MAX_WINDOW;
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
      .addCase(fetchShipments.rejected, (state, action) => {
        markListFetchSettled(state);
        state.loadingMore = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Không tải được vận đơn';
      })
      .addCase(fetchShipmentCounts.pending, state => {
        state.countsLoading = true;
      })
      .addCase(fetchShipmentCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(logout.fulfilled, state => {
        Object.assign(state, initialState);
      })
      .addCase(logout.rejected, state => {
        Object.assign(state, initialState);
      });
  },
});

export const { setShipmentListFilters, clearShipmentListFilters } =
  shipmentSlice.actions;
export const shipmentReducer = shipmentSlice.reducer;
