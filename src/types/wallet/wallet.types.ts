/** Domain models for the wallet (nạp/rút tiền) feature. */

export type WalletMode = 'topup' | 'withdraw';

export type WalletTab = 'form' | 'history';

export type WalletTransactionType = 'topup' | 'withdraw';

export type WalletTransactionStatus = 'success' | 'pending' | 'failed';

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amountVnd: number;
  createdAt: string;
  status: WalletTransactionStatus;
}
