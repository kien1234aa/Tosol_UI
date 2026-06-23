import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { EMPTY_ORDER_ADVANCED_FILTERS } from '@/src/configs/orders/orderFilters.constants';
import {
  EMPTY_ORDER_HOME_BADGE_COUNTS,
  type OrderHomeBadgeCounts,
} from '@/src/helpers/home/orderBadge.helpers';
import type { OrderListItem } from '@/src/types/orders/orders.types';
import type { OrderAdvancedFilters } from '@/src/types/orders/orderFilters.types';
import { mapSellerCountersToOrderHomeBadges } from '@/src/helpers/counters/counters.helpers';
import { fetchCountersThunk } from '@/src/redux/counters/countersThunks';
import { fetchOrdersThunk, fetchOrderDashboardCountsThunk } from './ordersThunks';

export type OrdersListStatus = 'idle' | 'loading' | 'loadingMore' | 'success' | 'error';
export type OrderDashboardBadgeStatus = 'idle' | 'loading' | 'success' | 'error';

export interface OrdersState {
  listFilters: OrderAdvancedFilters;
  listCustomerId: number | null;
  listCustomerName: string | null;
  items: OrderListItem[];
  listStatus: OrdersListStatus;
  listError: string | null;
  currentPage: number;
  lastPage: number;
  total: number;
  dashboardBadgeCounts: OrderHomeBadgeCounts;
  dashboardBadgeStatus: OrderDashboardBadgeStatus;
  dashboardBadgeFetchedAt: number | null;
}

const initialState: OrdersState = {
  listFilters: EMPTY_ORDER_ADVANCED_FILTERS,
  listCustomerId: null,
  listCustomerName: null,
  items: [],
  listStatus: 'idle',
  listError: null,
  currentPage: 0,
  lastPage: 0,
  total: 0,
  dashboardBadgeCounts: { ...EMPTY_ORDER_HOME_BADGE_COUNTS },
  dashboardBadgeStatus: 'idle',
  dashboardBadgeFetchedAt: null,
};

function resetListPagination(state: OrdersState): void {
  state.items = [];
  state.currentPage = 0;
  state.lastPage = 0;
  state.total = 0;
  state.listError = null;
  state.listStatus = 'idle';
}

function mergeOrderListItems(
  existing: OrderListItem[],
  incoming: OrderListItem[],
  append: boolean,
): OrderListItem[] {
  const merged = append ? [...existing, ...incoming] : incoming;
  const seen = new Set<string>();

  return merged.filter(item => {
    const key = item.orderNumber || item.uuid;
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderListFilters(state, action: PayloadAction<OrderAdvancedFilters>) {
      state.listFilters = action.payload;
      resetListPagination(state);
    },
    setOrderListCustomerFilter(
      state,
      action: PayloadAction<{ customerId: number; customerName: string }>,
    ) {
      state.listCustomerId = action.payload.customerId;
      state.listCustomerName = action.payload.customerName;
      resetListPagination(state);
    },
    clearOrderListCustomerFilter(state) {
      state.listCustomerId = null;
      state.listCustomerName = null;
      resetListPagination(state);
    },
    resetOrdersState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrdersThunk.pending, (state, action) => {
        state.listError = null;
        state.listStatus = action.meta.arg.append ? 'loadingMore' : 'loading';
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.listStatus = 'success';
        state.currentPage = action.payload.currentPage;
        state.lastPage = action.payload.lastPage;
        state.total = action.payload.total;

        if (action.payload.append) {
          state.items = mergeOrderListItems(
            state.items,
            action.payload.orders,
            true,
          );
        } else {
          state.items = mergeOrderListItems([], action.payload.orders, false);
        }
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.listStatus = 'error';
        state.listError =
          action.payload ?? 'Không thể tải danh sách đơn hàng';
      })
      .addCase(fetchOrderDashboardCountsThunk.pending, state => {
        state.dashboardBadgeStatus = 'loading';
      })
      .addCase(fetchOrderDashboardCountsThunk.fulfilled, (state, action) => {
        state.dashboardBadgeStatus = 'success';
        state.dashboardBadgeCounts = action.payload;
        state.dashboardBadgeFetchedAt = Date.now();
      })
      .addCase(fetchOrderDashboardCountsThunk.rejected, state => {
        state.dashboardBadgeStatus = 'error';
      })
      .addCase(fetchCountersThunk.fulfilled, (state, action) => {
        state.dashboardBadgeStatus = 'success';
        state.dashboardBadgeCounts = mapSellerCountersToOrderHomeBadges(
          action.payload.seller,
        );
        state.dashboardBadgeFetchedAt = Date.now();
      });
  },
});

export const {
  setOrderListFilters,
  setOrderListCustomerFilter,
  clearOrderListCustomerFilter,
  resetOrdersState,
} = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
