import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type OutboundOrderDetailTabId =
  | 'info'
  | 'items'
  | 'packing'
  | 'activity';

export const OUTBOUND_ORDER_DETAIL_TABS: {
  id: OutboundOrderDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'items';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'items', label: 'Sản phẩm', icon: 'package', badgeFrom: 'items' },
  { id: 'packing', label: 'Đóng gói', icon: 'cube' },
  { id: 'activity', label: 'Hoạt động', icon: 'activity' },
];
