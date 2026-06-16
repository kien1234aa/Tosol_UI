import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type InvoiceDetailTabId = 'info' | 'items' | 'payment';

export const INVOICE_DETAIL_TABS: {
  id: InvoiceDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'items';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'items', label: 'Các mục', icon: 'clipboard', badgeFrom: 'items' },
  { id: 'payment', label: 'Thanh toán', icon: 'card' },
];
