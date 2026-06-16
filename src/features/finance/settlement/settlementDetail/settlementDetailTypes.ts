import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type SettlementDetailTabId = 'info' | 'currency' | 'payment';

export type SettlementDetailTabDef = {
  id: SettlementDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'items';
};

export const SETTLEMENT_DETAIL_TABS: SettlementDetailTabDef[] = [
  { id: 'info', label: 'Thông tin chung', icon: 'info' },
  { id: 'currency', label: 'Chi tiết phí', icon: 'cash', badgeFrom: 'items' },
  { id: 'payment', label: 'Thanh toán', icon: 'card' },
];
