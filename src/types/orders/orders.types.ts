/** Domain models for the orders list tab. */

export type OrderStatus =
  | 'awaitingDeposit'
  | 'awaitingPayment'
  | 'readyToShip'
  | 'processing';

export type OrderStatusFilter = OrderStatus | 'all';

export interface OrderListItem {
  id: string;
  createdAt: string;
  totalCostVnd: number;
  paidVnd: number;
  packageCount: number;
  status: OrderStatus;
  productName: string;
  productQuantity: number;
}

export interface OrderDetailProduct {
  id: string;
  name: string;
  variant: string;
  priceCny: number;
  quantity: number;
}

export interface OrderDetailCosts {
  goodsVnd: number;
  estimatedFeeVnd: number;
  depositVnd: number;
  totalVnd: number;
  paidVnd: number;
  remainingVnd: number;
}

export interface OrderDetail extends OrderListItem {
  supplierName: string;
  note: string;
  insurance: boolean;
  woodPacking: boolean;
  products: OrderDetailProduct[];
  costs: OrderDetailCosts;
}
