export type OrderRowStatus =
  | 'cancelled'
  | 'pending'
  | 'confirmed'
  | 'packing'
  | 'shipping'
  | 'ready'
  | 'delivered'
  | 'transferring'
  | 'pending_transfer'
  | 'transfer_failed'
  | 'returned'
  | 'partially_returned';

export type OrderPaymentStatus =
  | 'disabled'
  | 'pending_payment'
  | 'paid'
  | 'partial_payment'
  | 'pending_refund'
  | 'refunded';

/** Một dòng sản phẩm xem trước trên thẻ / bảng danh sách đơn. */
export type OrderListProductPreview = {
  name: string;
  thumbUrl?: string | null;
};

export type OrderListRow = {
  /** Mã đơn (order_number) — GET /sale-orders/{order_number} */
  id: string;
  /** Khóa ổn định cho list (id số hoặc uuid) */
  key: string;
  /** Số dòng line item trên đơn (0 nếu API không gửi). */
  itemCount: number;
  /** Dòng đầu (luôn đồng bộ với `productName` / `thumbUrl`). */
  productName: string;
  thumbUrl?: string | null;
  /** Dòng thứ hai khi đơn có ≥2 sản phẩm. */
  secondProduct?: OrderListProductPreview | null;
  /** Khi >2 dòng: hiển thị «×N sản phẩm khác» (N = tổng số dòng SP). */
  moreProductsCount: number;
  customerName: string;
  customerPhone: string;
  storeName: string;
  packingWarehouseName: string;
  totalAmount: string;
  status: OrderRowStatus;
  payment: OrderPaymentStatus;
  creatorName: string;
  createdAtDisplay: string;
};
