import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type PurchaseOrderDetailTabId =
  | 'info'
  | 'products'
  | 'compare'
  | 'documents'
  | 'activity';

export const PO_DETAIL_TABS: {
  id: PurchaseOrderDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'items';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'products', label: 'Sản phẩm', icon: 'package', badgeFrom: 'items' },
  { id: 'compare', label: 'So sánh', icon: 'compare' },
  { id: 'documents', label: 'Chứng từ', icon: 'document' },
  { id: 'activity', label: 'Hoạt động', icon: 'activity' },
];
