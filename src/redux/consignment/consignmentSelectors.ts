import { createSelector } from '@reduxjs/toolkit';
import { filterConsignmentByStatus } from '@/src/helpers/consignment';
import type { RootState } from '@/src/redux/rootReducer';

const selectConsignmentState = (state: RootState) => state.consignment;

export const selectConsignmentStatusFilter = createSelector(
  selectConsignmentState,
  state => state.statusFilter,
);

export const selectConsignmentItems = createSelector(
  selectConsignmentState,
  state => state.items,
);

export const selectFilteredConsignmentItems = createSelector(
  [selectConsignmentItems, selectConsignmentStatusFilter],
  (items, statusFilter) => filterConsignmentByStatus(items, statusFilter),
);

export const selectConsignmentById = createSelector(
  [selectConsignmentItems, (_state: RootState, orderId: string) => orderId],
  (items, orderId) => items.find(order => order.id === orderId),
);
