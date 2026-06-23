/** Domain models for the orders list tab. */

export type OrderStatusFilter =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'packing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface OrderListItem {
  id: string;
  orderNumber: string;
  uuid: string;
  createdAt: string;
  totalCostVnd: number;
  paidVnd: number;
  remainingVnd: number;
  packageCount: number;
  status: string;
  paymentStatus: string;
  productName: string;
  productQuantity: number;
  thumbnailUrl?: string | null;
  customerName: string;
  shopName: string;
}

export type OrderStatus = OrderListItem['status'];

export interface OrderDetailProduct {
  id: string;
  name: string;
  sku: string;
  unitPriceVnd: number;
  quantity: number;
  lineTotalVnd: number;
  thumbnailUrl?: string | null;
}

export interface OrderDetailShipping {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  shippingPartnerName: string;
  trackingNumber: string | null;
  shippingFeeVnd: number;
  collectCod: boolean;
  codAmountVnd: number;
  shippingPayer: string;
  shipmentStatus: string | null;
  shipmentStatusLabel: string | null;
}

export type OrderDetailChildOrderKind =
  | 'packing'
  | 'outbound'
  | 'return'
  | 'box';

export interface OrderDetailChildOrder {
  id: string;
  kind: OrderDetailChildOrderKind;
  orderNumber: string;
  status: string;
  statusLabel: string;
}

export interface OrderDetailCosts {
  goodsVnd: number;
  discountVnd: number;
  taxVnd: number;
  shippingFeeVnd: number;
  totalVnd: number;
  paidVnd: number;
  remainingVnd: number;
}

export interface OrderDetail extends OrderListItem {
  orderDate: string;
  paymentMethod: string;
  note: string;
  hasIssue: boolean;
  issueNote: string | null;
  creatorName: string;
  warehouseName: string;
  customerPhone: string;
  customerAddress: string;
  packingOrderNumber: string | null;
  childOrders: OrderDetailChildOrder[];
  products: OrderDetailProduct[];
  shipping: OrderDetailShipping | null;
  costs: OrderDetailCosts;
}
