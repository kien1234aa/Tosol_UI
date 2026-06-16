import type { DeliveredConsignmentItem } from '@/src/types/consignment/deliveredConsignment.types';

export const deliveredConsignmentCopy = {
  screenTitle: 'Kiện hàng đã giao',
  back: 'Quay lại',
  statusBadge: 'Đã giao',
  idLabel: 'Mã kiện:',
  deliveredAtLabel: 'Ngày giao:',
  trackingCodeLabel: 'Mã vận đơn:',
  productNameLabel: 'Sản phẩm:',
  weightLabel: 'Cân nặng:',
  costLabel: 'Chi phí:',
  empty: 'Chưa có kiện hàng đã giao',
} as const;

/** Mock delivered consignment packages. */
export const mockDeliveredConsignmentItems: DeliveredConsignmentItem[] = [
  {
    id: 'KH12788',
    deliveredAt: '2026-06-10',
    trackingCode: 'SF1122003344',
    productName: 'Áo khoác gió nam chống nước',
    weightKg: 0.95,
    costVnd: 142_000,
  },
  {
    id: 'KH12702',
    deliveredAt: '2026-06-05',
    trackingCode: 'YT4455667788',
    productName: 'Bộ nồi inox 5 món',
    weightKg: 4.2,
    costVnd: 356_500,
  },
  {
    id: 'KH12655',
    deliveredAt: '2026-05-28',
    trackingCode: 'JD9988776655',
    productName: 'Đèn bàn LED chống cận',
    weightKg: 1.3,
    costVnd: 98_900,
  },
];
