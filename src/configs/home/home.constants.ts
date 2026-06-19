import type {
  HomeActionItem,
  QuickActionItem,
} from '@/src/types/home/home.types';

/** Static, localized copy for the home dashboard surface. */
export const homeCopy = {
  greeting: 'Xin chào',
  ordersSection: 'Đơn hàng',
  packagesSection: 'Kiện hàng',
  quickActionsSection: 'Thao tác nhanh',
  fallbackName: 'Khách',
} as const;

/** "Đơn hàng" icon grid actions. */
export const orderActions: HomeActionItem[] = [
  { key: 'orderCreate', label: 'Tạo đơn' },
  { key: 'orderList', label: 'Danh sách đơn' },
  { key: 'orderPayment', label: 'Chờ thanh toán' },
  { key: 'orderReady', label: 'Sẵn sàng giao' },
];

/** "Kiện hàng" icon grid actions. */
export const packageActions: HomeActionItem[] = [
  { key: 'packageCreate', label: 'Tạo đơn' },
  { key: 'packageList', label: 'Danh sách đơn' },
  { key: 'packagePayment', label: 'Chờ thanh toán' },
  { key: 'packageReady', label: 'Sẵn sàng giao' },
];

/** "Thao tác nhanh" quick-action cards. */
export const quickActions: QuickActionItem[] = [
  { key: 'walletTopup', label: 'Nạp/rút tiền' },
  { key: 'costEstimate', label: 'Ước tính chi phí' },
  { key: 'transactionHistory', label: 'Lịch sử giao dịch' },
  { key: 'complaints', label: 'Danh sách khiếu nại' },
  { key: 'deliveryRequest', label: 'Yêu cầu giao hàng' },
];
