import type { OrderHomeBadgeCounts } from '@/src/helpers/home/orderBadge.helpers';
import type { SellerCounters } from '@/src/types/counters/counters.types';

/** Map seller counters to the home dashboard order badges. */
export function mapSellerCountersToOrderHomeBadges(
  seller: SellerCounters,
): OrderHomeBadgeCounts {
  return {
    orderList:
      seller.orders_pending +
      seller.orders_confirmed +
      seller.orders_processing +
      seller.orders_ready_to_ship +
      seller.orders_issue,
    orderPayment: seller.invoices_unpaid,
    orderReady: seller.orders_ready_to_ship,
  };
}
