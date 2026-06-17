/** Domain models for the home dashboard feature. */

/** Keys for the order + package icon actions on the dashboard. */
export type HomeActionKey =
  | 'orderCart'
  | 'orderList'
  | 'orderPayment'
  | 'orderReady'
  | 'packageCreate'
  | 'packageList'
  | 'packagePayment'
  | 'packageReady';

/** Keys for the "Thao tác nhanh" (quick action) cards. */
export type QuickActionKey =
  | 'walletTopup'
  | 'costEstimate'
  | 'transactionHistory'
  | 'complaints'
  | 'deliveryRequest';

/** A single icon action shown in the order/package grids. */
export interface HomeActionItem {
  key: HomeActionKey;
  label: string;
}

/** A single quick-action card. */
export interface QuickActionItem {
  key: QuickActionKey;
  label: string;
}

/** Notification badge counts keyed by action. */
export type HomeBadges = Partial<Record<HomeActionKey, number>>;
