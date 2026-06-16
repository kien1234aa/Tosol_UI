export type SettlementRowStatus =
  | 'draft'
  | 'confirmed'
  | 'settled'
  | 'cancelled';

export type SettlementListFilter = 'all' | SettlementRowStatus;

/** Chiều số tiền ròng (hiển thị badge). */
export type SettlementNetDirection = 'seller_pays_tosol' | 'tosol_pays_seller';

export type SettlementListRow = {
  id: string;
  settlementNumber: string;
  sellerName: string | null;
  sellerCode: string | null;
  periodLabel: string | null;
  codCollectedDisplay: string | null;
  totalFeeDisplay: string | null;
  netAmountDisplay: string | null;
  netDirection: SettlementNetDirection;
  netDirectionLabel: string;
  status: SettlementRowStatus;
  statusLabel: string;
};
