import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type CustomerDetailTabId = 'info' | 'orders' | 'stats' | 'activity';

export const CUSTOMER_DETAIL_TABS: {
  id: CustomerDetailTabId;
  label: string;
  icon: SystemIconName;
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'orders', label: 'Đơn hàng', icon: 'cart' },
  { id: 'stats', label: 'Thống kê', icon: 'chart' },
  { id: 'activity', label: 'Hoạt động', icon: 'list' },
];
