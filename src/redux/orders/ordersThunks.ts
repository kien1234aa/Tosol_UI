import { createAsyncThunk } from '@reduxjs/toolkit';
import { saleOrdersService } from '@/src/apis/orders/saleOrders.api';
import type { OrderHomeBadgeCounts } from '@/src/helpers/home/orderBadge.helpers';
import { mapSaleOrdersToListItems } from '@/src/helpers/orders/saleOrder.helpers';
import type { OrderAdvancedFilters } from '@/src/types/orders/orderFilters.types';
import type { RootState } from '../rootReducer';

export interface FetchOrdersPayload {
  page: number;
  append: boolean;
  force?: boolean;
}

export interface FetchOrdersResult {
  orders: ReturnType<typeof mapSaleOrdersToListItems>;
  currentPage: number;
  lastPage: number;
  total: number;
  append: boolean;
}

function buildListParams(
  filters: OrderAdvancedFilters,
  page: number,
  customerId: number | null,
): Parameters<typeof saleOrdersService.list>[0] {
  return {
    page,
    customerId: customerId ?? undefined,
    status: filters.status || undefined,
    paymentStatus: filters.paymentStatus || undefined,
    hasIssue:
      filters.hasIssue === 'yes'
        ? true
        : filters.hasIssue === 'no'
          ? false
          : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  };
}

export const fetchOrdersThunk = createAsyncThunk<
  FetchOrdersResult,
  FetchOrdersPayload,
  { rejectValue: string; state: RootState }
>(
  'orders/fetchOrders',
  async ({ page, append }, { getState, rejectWithValue }) => {
    try {
      const { listFilters, listCustomerId } = getState().orders;
      const { data, meta } = await saleOrdersService.list(
        buildListParams(listFilters, page, listCustomerId),
      );

      return {
        orders: mapSaleOrdersToListItems(data),
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        total: meta.total,
        append,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng';
      return rejectWithValue(message);
    }
  },
  {
    condition: ({ page, append, force }, { getState }) => {
      const { listStatus, currentPage, lastPage } = getState().orders;

      if (listStatus === 'loading' || listStatus === 'loadingMore') {
        return false;
      }

      if (
        !force &&
        !append &&
        page === 1 &&
        listStatus === 'success' &&
        currentPage > 0
      ) {
        return false;
      }

      if (append && currentPage >= lastPage) {
        return false;
      }

      if (append && page !== currentPage + 1) {
        return false;
      }

      return true;
    },
  },
);

/** Lấy tổng số đơn theo từng nhóm để hiển thị badge trên màn Home. */
export const fetchOrderDashboardCountsThunk = createAsyncThunk<
  OrderHomeBadgeCounts,
  void,
  { rejectValue: string }
>('orders/fetchDashboardCounts', async (_, { rejectWithValue }) => {
  try {
    const [all, partialPayment, ready] = await Promise.all([
      saleOrdersService.list({ page: 1, perPage: 1 }),
      saleOrdersService.list({
        page: 1,
        perPage: 1,
        paymentStatus: 'partial_paid',
      }),
      saleOrdersService.list({ page: 1, perPage: 1, status: 'ready_to_ship' }),
    ]);

    return {
      orderList: all.meta.total,
      orderPayment: partialPayment.meta.total,
      orderReady: ready.meta.total,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể tải số lượng đơn hàng';
    return rejectWithValue(message);
  }
});
