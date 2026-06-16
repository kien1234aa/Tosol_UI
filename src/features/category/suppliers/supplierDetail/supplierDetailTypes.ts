import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type SupplierDetailTabId = 'info' | 'orders' | 'stats' | 'activity';

export const SUPPLIER_DETAIL_TABS: {
  id: SupplierDetailTabId;
  label: string;
  icon: SystemIconName;
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'orders', label: 'Đơn mua hàng', icon: 'cart' },
  { id: 'stats', label: 'Thống kê', icon: 'chart' },
  { id: 'activity', label: 'Hoạt động', icon: 'list' },
];
