import type { HomeActionItem } from '@/src/types/home/home.types';

/** Static, localized copy for the home dashboard surface. */
export const homeCopy = {
  greeting: 'Xin chào',
  ordersSection: 'Đơn hàng',
  fallbackName: 'Khách',
} as const;

/** "Đơn hàng" icon grid actions. */
export const orderActions: HomeActionItem[] = [
  { key: 'orderCreate', label: 'Tạo đơn' },
  { key: 'orderList', label: 'Danh sách đơn' },
  { key: 'orderReady', label: 'Sẵn sàng giao' },
];
