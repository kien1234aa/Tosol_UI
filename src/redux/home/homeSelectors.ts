import { createSelector } from '@reduxjs/toolkit';
import { mapOrderHomeBadgeCountsToHomeBadges } from '@/src/helpers/home/orderBadge.helpers';
import { selectDraftOrderCount } from '@/src/redux/createOrderDraft';
import { selectOrderDashboardBadgeCounts } from '@/src/redux/orders/ordersSelectors';
import type { RootState } from '../store';

const selectHomeState = (state: RootState) => state.home;

export const selectHomeBadges = createSelector(
  selectHomeState,
  home => home.badges,
);

/** Badge trên dashboard — đồng bộ giỏ hàng + số đơn từ API. */
export const selectHomeDashboardBadges = createSelector(
  [selectHomeBadges, selectDraftOrderCount, selectOrderDashboardBadgeCounts],
  (badges, draftCount, orderCounts) => {
    const next = {
      ...badges,
      ...mapOrderHomeBadgeCountsToHomeBadges(orderCounts),
    };

    if (draftCount > 0) {
      next.orderCreate = draftCount;
    } else {
      delete next.orderCreate;
    }

    return next;
  },
);
