/** Domain models for the "đơn hàng đã giao" (delivered orders) screen. */

export interface DeliveredOrderItem {
  id: string;
  deliveredAt: string;
  productName: string;
  packageCount: number;
  totalCostVnd: number;
}
