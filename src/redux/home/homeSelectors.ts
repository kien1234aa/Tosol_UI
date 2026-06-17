import { createSelector } from '@reduxjs/toolkit';
import { mapOrderHomeBadgeCountsToHomeBadges } from '@/src/helpers/home/orderBadge.helpers';
import { selectCartBadgeCount } from '@/src/redux/cart/cartSelectors';
import { selectOrderDashboardBadgeCounts } from '@/src/redux/orders/ordersSelectors';
import type { RootState } from '../store';

const selectHomeState = (state: RootState) => state.home;

export const selectHomeBadges = createSelector(
  selectHomeState,
  home => home.badges,
);

/** Badge trên dashboard — đồng bộ giỏ hàng + số đơn từ API. */
export const selectHomeDashboardBadges = createSelector(
  [selectHomeBadges, selectCartBadgeCount, selectOrderDashboardBadgeCounts],
  (badges, cartCount, orderCounts) => {
    const next = {
      ...badges,
      ...mapOrderHomeBadgeCountsToHomeBadges(orderCounts),
    };

    if (cartCount > 0) {
      next.orderCart = cartCount;
    } else {
      delete next.orderCart;
    }

    return next;
  },
);
