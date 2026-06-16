/** Domain models for the consignment "chờ thanh toán" (awaiting payment) screen. */

export interface AwaitingPaymentItem {
  id: string;
  createdAt: string;
  trackingCode: string;
  productName: string;
  weightKg: number;
  payableVnd: number;
}

export interface AwaitingPaymentTotals {
  payableVnd: number;
  selectedCount: number;
}
