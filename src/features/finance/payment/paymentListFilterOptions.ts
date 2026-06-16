import type {
  PaymentListFilter,
  PaymentListKindFilter,
  PaymentListMethodFilter,
} from './paymentListTypes';

export const PAYMENT_METHOD_FILTER_OPTIONS: {
  key: PaymentListMethodFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'cash', label: 'Tiền mặt' },
  { key: 'bank_transfer', label: 'Chuyển khoản' },
  { key: 'cod', label: 'Thu hộ(COD)' },
  { key: 'momo', label: 'Momo' },
  { key: 'vnpay', label: 'VNPay' },
  { key: 'other', label: 'Khác' },
];

export const PAYMENT_KIND_FILTER_OPTIONS: {
  key: PaymentListKindFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'refund', label: 'Hoàn Tiền' },
];

export const PAYMENT_STATUS_FILTER_OPTIONS: {
  key: PaymentListFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'failed', label: 'Thất bại' },
  { key: 'cancelled', label: 'Đã hủy' },
];
