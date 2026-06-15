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

/** "Đơn hàng" icon grid — five evenly spaced actions. */
export const orderActions: HomeActionItem[] = [
  { key: 'orderCart', label: 'Giỏ hàng' },
  { key: 'orderList', label: 'Danh sách đơn' },
  { key: 'orderDeposit', label: 'Đơn chờ cọc' },
  { key: 'orderPayment', label: 'Chờ thanh toán' },
  { key: 'orderReady', label: 'Sẵn sàng giao' },
];

/** "Kiện hàng" icon grid — four evenly spaced actions. */
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

/** Number of columns each icon grid renders across. */
export const homeGridColumns = {
  orders: 5,
  packages: 4,
} as const;
