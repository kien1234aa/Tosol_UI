import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/src/redux/rootReducer';

const selectOrdersState = (state: RootState) => state.orders;

export const selectOrderListFilters = createSelector(
  selectOrdersState,
  state => state.listFilters,
);

export const selectOrderListSearch = createSelector(
  selectOrdersState,
  state => state.listSearch,
);

export const selectOrderItems = createSelector(
  selectOrdersState,
  state => state.items,
);

export const selectFilteredOrderItems = selectOrderItems;

export const selectOrdersListStatus = createSelector(
  selectOrdersState,
  state => state.listStatus,
);

export const selectOrdersListError = createSelector(
  selectOrdersState,
  state => state.listError,
);

export const selectOrdersCurrentPage = createSelector(
  selectOrdersState,
  state => state.currentPage,
);

export const selectOrdersLastPage = createSelector(
  selectOrdersState,
  state => state.lastPage,
);

export const selectHasMoreOrders = createSelector(
  [selectOrdersCurrentPage, selectOrdersLastPage],
  (currentPage, lastPage) => currentPage > 0 && currentPage < lastPage,
);

export const selectIsLoadingOrders = createSelector(
  selectOrdersListStatus,
  status => status === 'loading',
);

export const selectIsLoadingMoreOrders = createSelector(
  selectOrdersListStatus,
  status => status === 'loadingMore',
);

export const selectOrderById = createSelector(
  [selectOrderItems, (_state: RootState, orderId: string) => orderId],
  (items, orderId) => items.find(order => order.id === orderId),
);

export const selectOrderDashboardBadgeCounts = createSelector(
  selectOrdersState,
  state => state.dashboardBadgeCounts,
);

/** @deprecated Use selectOrderListFilters */
export const selectOrderStatusFilter = createSelector(
  selectOrderListFilters,
  filters => filters.status,
);
