import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type PriceListDetailTabId = 'info' | 'prices';

export type PriceListDetailTabDef = {
  id: PriceListDetailTabId;
  label: string;
  icon: SystemIconName;
};

export const PRICE_LIST_DETAIL_TABS: readonly PriceListDetailTabDef[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'prices', label: 'Bảng giá', icon: 'cash' },
];
