import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mockOrderListItems } from '@/src/configs/orders';
import type { OrderListItem, OrderStatusFilter } from '@/src/types/orders/orders.types';

export interface OrdersState {
  statusFilter: OrderStatusFilter;
  items: OrderListItem[];
}

const initialState: OrdersState = {
  statusFilter: 'all',
  items: mockOrderListItems,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrderStatusFilter(state, action: PayloadAction<OrderStatusFilter>) {
      state.statusFilter = action.payload;
    },
    removeOrderItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    resetOrdersState() {
      return initialState;
    },
  },
});

export const { setOrderStatusFilter, removeOrderItem, resetOrdersState } =
  ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
