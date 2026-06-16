export type PurchaseOrderRowStatus =
  | 'confirmed'
  | 'partial'
  | 'received'
  | 'draft'
  | 'cancelled'
  | 'unknown';

export type PurchaseOrderListRow = {
  id: number;
  orderNumber: string;
  /** NCC — null nếu không có. */
  supplierName: string | null;
  /** Kho — null nếu không có. */
  warehouseName: string | null;
  /** Tên SP / số dòng — null nếu không có. */
  productLabel: string | null;
  /** Tên sản phẩm dòng thứ hai khi đơn có ≥2 dòng SP. */
  productSecondLabel: string | null;
  /** Số sản phẩm dôi ra sau 2 dòng đầu — dùng cho «+N sản phẩm khác». */
  moreProductsCount: number;
  productThumb: string | null;
  rowStatus: PurchaseOrderRowStatus;
  statusLabel: string;
  expectedQty: number;
  receivedQty: number;
  progressPct: number;
  /** Tổng tiền — null nếu không có. */
  totalLabel: string | null;
  /** Ngày dự kiến — null nếu không có. */
  expectedDateLabel: string | null;
};
