export type PaymentListFilter =
  | 'all'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Lọc phương thức — map sang `filter[payment_method]` (chỉnh slug nếu API khác). */
export type PaymentListMethodFilter =
  | 'all'
  | 'cash'
  | 'bank_transfer'
  | 'cod'
  | 'momo'
  | 'vnpay'
  | 'other';

/** Loại giao dịch — `filter[type]`: `payment` | `refund`. */
export type PaymentListKindFilter = 'all' | 'payment' | 'refund';

export type PaymentListRowStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'unknown';

export type PaymentListRowKind = 'payment' | 'refund' | 'unknown';

export type PaymentListRow = {
  id: string;
  /** Mở chi tiết — ưu tiên `uuid`, không có thì `id`. */
  detailRef: string;
  paymentCode: string;
  /** Mã đơn — null nếu không có. */
  orderRef: string | null;
  customerName: string | null;
  amountDisplay: string | null;
  methodRaw: string | null;
  methodLabel: string;
  methodTone: 'bank' | 'cod' | 'cash' | 'muted';
  paidDateLabel: string | null;
  status: PaymentListRowStatus;
  statusLabel: string;
  kind: PaymentListRowKind;
  typeLabel: string;
};
