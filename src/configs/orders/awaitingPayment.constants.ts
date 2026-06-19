import type { AwaitingPaymentItem } from '@/src/types/orders/awaitingPayment.types';

export const awaitingPaymentCopy = {
  screenTitle: 'Kiện hàng chờ thanh toán',
  back: 'Quay lại',
  totalPayableLabel: 'Tổng tiền cần thanh toán',
  availableBalanceLabel: 'Số dư khả dụng:',
  pay: 'Thanh toán',
  selectAll: 'Chọn tất cả',
  deselectAll: 'Bỏ chọn',
  idLabel: 'Mã kiện:',
  createdAtLabel: 'Ngày tạo:',
  trackingCodeLabel: 'Mã vận đơn:',
  weightLabel: 'Cân nặng:',
  payableLabel: 'Cần thanh toán:',
  empty: 'Không có kiện hàng nào',
  selectPrompt: 'Vui lòng chọn ít nhất một kiện',
  paySuccess: 'Đã gửi yêu cầu thanh toán (mock)',
} as const;

/** Mock available wallet balance shown on the awaiting payment screen. */
export const mockAvailableBalanceVnd = 1_200_000;

/** Mock consignment packages waiting for payment. */
export const mockAwaitingPaymentItems: AwaitingPaymentItem[] = [
  {
    id: 'KH12954',
    createdAt: '2026-06-12',
    trackingCode: 'SF7788991234',
    productName: 'Tai nghe Bluetooth chống ồn',
    weightKg: 0.85,
    payableVnd: 623_455,
  },
  {
    id: 'KH12933',
    createdAt: '2026-06-11',
    trackingCode: 'YT5566123400',
    productName: 'Bình giữ nhiệt inox 500ml',
    weightKg: 1.2,
    payableVnd: 256_000,
  },
  {
    id: 'KH12921',
    createdAt: '2026-06-09',
    trackingCode: 'JD9900112233',
    productName: 'Máy xay sinh tố đa năng',
    weightKg: 3.45,
    payableVnd: 845_250,
  },
];
