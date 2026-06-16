import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type PackingOrderDetailTabId = 'info' | 'boxes' | 'activity';

export const PACKING_ORDER_DETAIL_TABS: {
  id: PackingOrderDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'boxes';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'boxes', label: 'Hộp', icon: 'package', badgeFrom: 'boxes' },
  { id: 'activity', label: 'Hoạt động', icon: 'activity' },
];
