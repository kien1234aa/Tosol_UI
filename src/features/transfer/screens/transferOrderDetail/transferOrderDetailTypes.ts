import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type TransferOrderDetailTabId =
  | 'info'
  | 'outbound'
  | 'boxes'
  | 'inbound';

export const TRANSFER_ORDER_DETAIL_TABS: {
  id: TransferOrderDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'outbound' | 'boxes' | 'inbound';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  {
    id: 'outbound',
    label: 'Phiếu xuất kho',
    icon: 'truck',
    badgeFrom: 'outbound',
  },
  { id: 'boxes', label: 'Thùng hàng', icon: 'package', badgeFrom: 'boxes' },
  {
    id: 'inbound',
    label: 'Phiếu nhập kho',
    icon: 'download',
    badgeFrom: 'inbound',
  },
];
