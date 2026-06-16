import type { AppDispatch } from '@app/store';
import { scheduleAfterUIReady } from '@shared/utils/scheduleAfterUIReady';
import { fetchSalesMenuShops } from '@services/settings/shopSlice';
import {
  fetchOrderCounts,
  fetchSaleOrders,
} from '@services/sales/orderSlice';

let prefetchScheduled = false;

/**
 * Prefetch nhẹ sau khi UI ổn định — tránh 5 request cùng lúc làm lag lúc vào app.
 */
export function scheduleSalesPrefetch(dispatch: AppDispatch): void {
  if (prefetchScheduled) {
    return;
  }
  prefetchScheduled = true;
  scheduleAfterUIReady(() => {
    void dispatch(fetchSalesMenuShops());
    void dispatch(fetchSaleOrders({ page: 1 }));
    void dispatch(fetchOrderCounts());
  });
}

export function resetSalesPrefetchFlag(): void {
  prefetchScheduled = false;
}
