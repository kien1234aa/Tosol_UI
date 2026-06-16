import type { AwaitingDepositItem } from '@/src/types/orders/awaitingDeposit.types';

export const awaitingDepositCopy = {
  screenTitle: 'Đang chờ cọc',
  back: 'Quay lại',
  totalGoodsLabel: 'Tổng tiền hàng:',
  totalDepositLabel: 'Tổng tiền cần đặt cọc:',
  availableBalanceLabel: 'Số dư khả dụng:',
  deposit: 'Đặt cọc',
  cancel: 'Hủy',
  selectAll: 'Chọn tất cả',
  deselectAll: 'Bỏ chọn',
  idLabel: 'ID:',
  createdAtLabel: 'Ngày tạo:',
  goodsLabel: 'Tiền hàng:',
  payableLabel: 'Cần thanh toán:',
  quantityLabel: 'Số lượng:',
  empty: 'Không có đơn nào đang chờ cọc',
  selectPrompt: 'Vui lòng chọn ít nhất một đơn',
  depositSuccess: 'Đã gửi yêu cầu đặt cọc (mock)',
  cancelSuccess: 'Đã hủy các đơn đã chọn (mock)',
} as const;

/** Mock wallet balance shown on the awaiting-deposit screen. */
export const mockAvailableBalanceVnd = 1_200_000;

/** Mock orders waiting for a deposit. */
export const mockAwaitingDepositItems: AwaitingDepositItem[] = [
  {
    id: '12995',
    createdAt: '2026-06-16',
    goodsVnd: 313_888,
    payableVnd: 219_722,
    quantity: 1,
    productName: 'Bộ dưỡng da chống lão hóa cao cấp',
  },
  {
    id: '12990',
    createdAt: '2026-06-16',
    goodsVnd: 168_500,
    payableVnd: 117_950,
    quantity: 2,
    productName: 'Tai nghe nhét tai thể thao không dây',
  },
  {
    id: '12984',
    createdAt: '2026-06-15',
    goodsVnd: 542_300,
    payableVnd: 379_610,
    quantity: 1,
    productName: 'Máy ảnh mini in ảnh lấy liền',
  },
  {
    id: '12977',
    createdAt: '2026-06-14',
    goodsVnd: 89_000,
    payableVnd: 62_300,
    quantity: 3,
    productName: 'Ốp lưng điện thoại chống sốc',
  },
];
