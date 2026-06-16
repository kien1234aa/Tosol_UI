/** Domain models for the "kiện hàng đã giao" (delivered consignment) screen. */

export interface DeliveredConsignmentItem {
  id: string;
  deliveredAt: string;
  trackingCode: string;
  productName: string;
  weightKg: number;
  costVnd: number;
}
