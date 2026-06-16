import type {
  ConsignmentOrderItem,
  ConsignmentStatusFilter,
} from '@/src/types/consignment/consignment.types';

export function formatConsignmentWeight(weightKg: number): string {
  return `${weightKg.toFixed(2)} kg`;
}

export function formatConsignmentCost(costVnd: number): string {
  return `${costVnd.toLocaleString('vi-VN')} đ`;
}

export function filterConsignmentByStatus(
  orders: ConsignmentOrderItem[],
  statusFilter: ConsignmentStatusFilter,
): ConsignmentOrderItem[] {
  if (statusFilter === 'all') {
    return orders;
  }
  return orders.filter(order => order.status === statusFilter);
}
