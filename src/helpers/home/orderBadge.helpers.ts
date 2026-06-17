import type { HomeActionKey } from '@/src/types/home/home.types';

export interface OrderHomeBadgeCounts {
  orderList: number;
  orderPayment: number;
  orderReady: number;
}

export const EMPTY_ORDER_HOME_BADGE_COUNTS: OrderHomeBadgeCounts = {
  orderList: 0,
  orderPayment: 0,
  orderReady: 0,
};

export function mapOrderHomeBadgeCountsToHomeBadges(
  counts: OrderHomeBadgeCounts,
): Partial<Record<HomeActionKey, number>> {
  const badges: Partial<Record<HomeActionKey, number>> = {};

  if (counts.orderList > 0) {
    badges.orderList = counts.orderList;
  }
  if (counts.orderPayment > 0) {
    badges.orderPayment = counts.orderPayment;
  }
  if (counts.orderReady > 0) {
    badges.orderReady = counts.orderReady;
  }

  return badges;
}
