import type {
  WalletTransaction,
  WalletTransactionStatus,
} from '@/src/types/wallet/wallet.types';

export const walletCopy = {
  topupTitle: 'Nạp tiền',
  withdrawTitle: 'Rút tiền',
  back: 'Quay lại',
  toggleToWithdraw: 'Rút tiền',
  toggleToTopup: 'Nạp tiền',
  topupTab: 'Nạp tiền',
  withdrawTab: 'Rút tiền',
  historyTab: 'Lịch sử',
  topupPlaceholder: 'Số tiền cần nạp (VNĐ)',
  withdrawPlaceholder: 'Số tiền cần rút (VNĐ)',
  createQr: 'Tạo QR Code',
  missingMoney: 'Không thấy tiền vào ví?',
  createWithdraw: 'Tạo yêu cầu rút tiền',
  amountRequired: 'Vui lòng nhập số tiền hợp lệ',
  qrCreated: 'Đã tạo QR Code (mock)',
  missingMoneyHint:
    'Tiền thường vào ví trong 1-5 phút. Nếu sau 30 phút chưa thấy, vui lòng liên hệ CSKH. (mock)',
  withdrawCreated: 'Đã gửi yêu cầu rút tiền (mock)',
  historyEmpty: 'Chưa có giao dịch nào',
  txnTopupLabel: 'Nạp tiền',
  txnWithdrawLabel: 'Rút tiền',
  amountLabel: 'Số tiền:',
  dateLabel: 'Thời gian:',
  statusLabel: 'Trạng thái:',
} as const;

export const walletStatusLabels: Record<WalletTransactionStatus, string> = {
  success: 'Thành công',
  pending: 'Đang xử lý',
  failed: 'Thất bại',
};

/** Mock wallet transaction history. */
export const mockWalletTransactions: WalletTransaction[] = [
  {
    id: 'GD20260614',
    type: 'topup',
    amountVnd: 2_000_000,
    createdAt: '2026-06-14',
    status: 'success',
  },
  {
    id: 'GD20260612',
    type: 'withdraw',
    amountVnd: 500_000,
    createdAt: '2026-06-12',
    status: 'pending',
  },
  {
    id: 'GD20260608',
    type: 'topup',
    amountVnd: 1_000_000,
    createdAt: '2026-06-08',
    status: 'success',
  },
  {
    id: 'GD20260601',
    type: 'withdraw',
    amountVnd: 300_000,
    createdAt: '2026-06-01',
    status: 'failed',
  },
];
