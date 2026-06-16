import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mockConsignmentOrders } from '@/src/configs/consignment';
import type {
  ConsignmentOrderItem,
  ConsignmentStatusFilter,
} from '@/src/types/consignment/consignment.types';

export interface ConsignmentDraftInput {
  trackingCode: string;
  productName: string;
  note: string;
}

export interface ConsignmentState {
  statusFilter: ConsignmentStatusFilter;
  items: ConsignmentOrderItem[];
}

const initialState: ConsignmentState = {
  statusFilter: 'all',
  items: mockConsignmentOrders,
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const consignmentSlice = createSlice({
  name: 'consignment',
  initialState,
  reducers: {
    setConsignmentStatusFilter(
      state,
      action: PayloadAction<ConsignmentStatusFilter>,
    ) {
      state.statusFilter = action.payload;
    },
    addConsignmentOrders(
      state,
      action: PayloadAction<ConsignmentDraftInput[]>,
    ) {
      const createdAt = todayIso();
      const baseId = Date.now();
      const newItems: ConsignmentOrderItem[] = action.payload.map(
        (draft, index) => ({
          id: `cns-${baseId}-${index}`,
          createdAt,
          trackingCode: draft.trackingCode.trim(),
          productName: draft.productName.trim(),
          status: 'awaitingChinaWarehouse',
          weightKg: 0,
          costVnd: 0,
          note: draft.note.trim(),
        }),
      );
      state.items = [...newItems, ...state.items];
    },
    removeConsignmentOrder(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    resetConsignmentState() {
      return initialState;
    },
  },
});

export const {
  setConsignmentStatusFilter,
  addConsignmentOrders,
  removeConsignmentOrder,
  resetConsignmentState,
} = consignmentSlice.actions;
export const consignmentReducer = consignmentSlice.reducer;
