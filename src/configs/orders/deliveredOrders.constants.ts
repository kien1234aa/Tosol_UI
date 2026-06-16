import type { DeliveredOrderItem } from '@/src/types/orders/deliveredOrders.types';

export const deliveredOrdersCopy = {
  screenTitle: 'Đơn hàng đã giao',
  back: 'Quay lại',
  statusBadge: 'Đã giao',
  idLabel: 'ID:',
  deliveredAtLabel: 'Ngày giao:',
  productNameLabel: 'Sản phẩm:',
  packageCountLabel: 'Số kiện hàng:',
  totalCostLabel: 'Tổng chi phí:',
  empty: 'Chưa có đơn hàng đã giao',
} as const;

/** Mock delivered orders. */
export const mockDeliveredOrderItems: DeliveredOrderItem[] = [
  {
    id: '12788',
    deliveredAt: '2026-06-10',
    productName: 'Áo khoác gió nam chống nước',
    packageCount: 1,
    totalCostVnd: 512_000,
  },
  {
    id: '12702',
    deliveredAt: '2026-06-05',
    productName: 'Bộ nồi inox 5 món',
    packageCount: 2,
    totalCostVnd: 1_356_500,
  },
  {
    id: '12655',
    deliveredAt: '2026-05-28',
    productName: 'Đèn bàn LED chống cận',
    packageCount: 1,
    totalCostVnd: 289_900,
  },
];
