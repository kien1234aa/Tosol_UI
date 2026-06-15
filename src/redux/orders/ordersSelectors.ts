import { createSelector } from '@reduxjs/toolkit';
import { filterOrdersByStatus } from '@/src/helpers/orders';
import type { RootState } from '@/src/redux/rootReducer';

const selectOrdersState = (state: RootState) => state.orders;

export const selectOrderStatusFilter = createSelector(
  selectOrdersState,
  state => state.statusFilter,
);

export const selectOrderItems = createSelector(
  selectOrdersState,
  state => state.items,
);

export const selectFilteredOrderItems = createSelector(
  [selectOrderItems, selectOrderStatusFilter],
  (items, statusFilter) => filterOrdersByStatus(items, statusFilter),
);

export const selectOrderById = createSelector(
  [selectOrderItems, (_state: RootState, orderId: string) => orderId],
  (items, orderId) => items.find(order => order.id === orderId),
);
