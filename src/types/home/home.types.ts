/** Domain models for the home dashboard feature. */

/** Keys for the order icon actions on the dashboard. */
export type HomeActionKey =
  | 'orderCreate'
  | 'orderList'
  | 'orderPayment'
  | 'orderReady';

/** A single icon action shown in the order grid. */
export interface HomeActionItem {
  key: HomeActionKey;
  label: string;
}

/** Notification badge counts keyed by action. */
export type HomeBadges = Partial<Record<HomeActionKey, number>>;
