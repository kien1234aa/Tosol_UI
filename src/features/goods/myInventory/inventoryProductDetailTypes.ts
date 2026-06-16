import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type InventoryProductDetailTabId = 'info' | 'batches';

export const INVENTORY_PRODUCT_DETAIL_TABS: {
  id: InventoryProductDetailTabId;
  label: string;
  icon: SystemIconName;
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'batches', label: 'Các lô hàng tồn kho', icon: 'package' },
];
