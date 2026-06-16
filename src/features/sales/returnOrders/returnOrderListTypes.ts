export type ReturnOrderRowStatus =
  | 'pending'
  | 'approved'
  | 'receiving'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'unknown';

export type ReturnOrderRowType = 'partial' | 'full' | 'unknown';

export type ReturnOrderRefundStatusUi =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'unknown';

export type ReturnOrderListRow = {
  key: string;
  returnCode: string;
  /** Seller — null nếu không có. */
  sellerName: string | null;
  /** Mã đơn gốc — null nếu không có. */
  originOrderNumber: string | null;
  /** Tên SP / số dòng — null nếu không có. */
  productName: string | null;
  /** Tên SP dòng 2 khi ≥2 sản phẩm. */
  productSecondLabel: string | null;
  /** Số SP dư sau 2 dòng đầu. */
  moreProductsCount: number;
  thumbUrl: string | null;
  status: ReturnOrderRowStatus;
  returnType: ReturnOrderRowType;
  /** Nhãn loại trả hiển thị — null khi không rõ. */
  returnTypeLabel: string | null;
  /** Lý do trả — null nếu không có. */
  reason: string | null;
  /** Số tiền hoàn — null nếu không có. */
  refundDisplay: string | null;
  refundStatus: ReturnOrderRefundStatusUi;
  /** Nhãn trạng thái hoàn tiền. */
  refundStatusLabel: string | null;
};
