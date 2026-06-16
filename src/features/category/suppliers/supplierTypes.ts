export type SupplierRowStatus = 'active' | 'inactive';

export type SupplierListRow = {
  id: number;
  key: string;
  codeLabel: string;
  name: string;
  /** Liên hệ gọn (người liên hệ / SĐT / email) — null nếu không có. */
  contactLabel: string | null;
  purchaseOrdersCount: number;
  status: SupplierRowStatus;
  createdLabel: string;
};
