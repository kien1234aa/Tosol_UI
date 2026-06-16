export type PackingOrderRowStatus =
  | 'pending'
  | 'packing'
  | 'cancelled'
  | 'completed'
  | 'other';

export type PackingOrderListRow = {
  id: number;
  uuid: string | null;
  orderNumber: string;
  rowStatus: PackingOrderRowStatus;
  statusLabel: string;
  warehouseName: string;
  sellerName: string;
  saleOrderNumber: string;
  productLabel: string;
  /** Tên sản phẩm dòng thứ hai khi đơn có ≥2 dòng SP. */
  productSecondLabel: string | null;
  /** Số sản phẩm dôi ra sau 2 dòng đầu — dùng cho «+N sản phẩm khác». */
  moreProductsCount: number;
  productThumb: string | null;
  pickProgressPct: number;
  packingProgressPct: number;
  boxesPackedLabel: string;
  hasPendingUnpack: boolean;
  noteSnippet: string;
  createdAtLabel: string;
};
