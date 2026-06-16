import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type InboundOrderDetailTabId =
  | 'info'
  | 'items'
  | 'purchase'
  | 'activity';

export const INBOUND_ORDER_DETAIL_TABS: {
  id: InboundOrderDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'inbound_lines' | 'po_lines';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  {
    id: 'items',
    label: 'Dòng nhập',
    icon: 'package',
    badgeFrom: 'inbound_lines',
  },
  { id: 'purchase', label: 'Đơn mua', icon: 'document', badgeFrom: 'po_lines' },
  { id: 'activity', label: 'Hoạt động', icon: 'activity' },
];
