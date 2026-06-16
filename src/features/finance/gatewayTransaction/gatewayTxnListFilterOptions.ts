import type {
  GatewayTxnListFilter,
  GatewayTxnListTypeFilter,
} from './gatewayTransactionListTypes';

export const GATEWAY_TXN_STATUS_OPTIONS: {
  key: GatewayTxnListFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'failed', label: 'Thất bại' },
];

export const GATEWAY_TXN_TYPE_OPTIONS: {
  key: GatewayTxnListTypeFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'refund', label: 'Hoàn tiền' },
];
