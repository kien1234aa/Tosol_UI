export type OutboundOrderRowStatus =
  | 'pending'
  | 'picking'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'other';

export type OutboundOrderListRow = {
  id: number;
  uuid: string | null;
  orderNumber: string;
  rowStatus: OutboundOrderRowStatus;
  statusLabel: string;
  typeLabel: string;
  warehouseName: string;
  sellerName: string;
  linkedOrderLabel: string;
  productLabel: string;
  /** Tên sản phẩm dòng thứ hai khi đơn có ≥2 dòng SP. */
  productSecondLabel: string | null;
  /** Số sản phẩm dôi ra sau 2 dòng đầu — dùng cho «+N sản phẩm khác». */
  moreProductsCount: number;
  productThumb: string | null;
  pickProgressPct: number;
  qtyPickedLabel: string;
  recipientLabel: string;
  requiresPacking: boolean;
  noteSnippet: string;
  createdAtLabel: string;
};
