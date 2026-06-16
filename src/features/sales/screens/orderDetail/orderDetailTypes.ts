import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type OrderDetailTabId =
  | 'info'
  | 'products'
  | 'payment'
  | 'shipping'
  | 'history'
  | 'activity';

export const ORDER_TABS: {
  id: OrderDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'items';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'products', label: 'Sản phẩm', icon: 'package', badgeFrom: 'items' },
  { id: 'payment', label: 'Thanh toán', icon: 'card' },
  { id: 'shipping', label: 'Vận chuyển', icon: 'truck' },
  { id: 'history', label: 'Lịch sử', icon: 'analytics' },
  { id: 'activity', label: 'Nhật ký hoạt động', icon: 'activity' },
];
