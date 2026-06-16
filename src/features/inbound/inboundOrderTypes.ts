export type InboundOrderRowStatus =
  | 'pending'
  | 'receiving'
  | 'completed'
  | 'cancelled'
  | 'other';

export type InboundOrderListRow = {
  id: number;
  uuid: string | null;
  orderNumber: string;
  rowStatus: InboundOrderRowStatus;
  statusLabel: string;
  typeLabel: string;
  warehouseName: string;
  sellerName: string;
  linkedOrderLabel: string;
  supplierName: string;
  productLabel: string;
  /** Tên sản phẩm dòng thứ hai khi đơn có ≥2 dòng SP. */
  productSecondLabel: string | null;
  /** Số sản phẩm dôi ra sau 2 dòng đầu — dùng cho «+N sản phẩm khác». */
  moreProductsCount: number;
  productThumb: string | null;
  receiveProgressPct: number;
  qtyReceivedLabel: string;
  damagedHint: string;
  noteSnippet: string;
  createdAtLabel: string;
};
