import { mockOrderDetails } from '@/src/configs/orders';
import type {
  OrderDetail,
  OrderListItem,
  OrderStatusFilter,
} from '@/src/types/orders/orders.types';

export function formatOrderDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day}/${month}/${year}`;
}

export function formatOrderPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

export function filterOrdersByStatus(
  orders: OrderListItem[],
  statusFilter: OrderStatusFilter,
): OrderListItem[] {
  if (statusFilter === 'all') {
    return orders;
  }
  return orders.filter(order => order.status === statusFilter);
}

export function getOrderDetailById(orderId: string): OrderDetail | undefined {
  return mockOrderDetails[orderId];
}
