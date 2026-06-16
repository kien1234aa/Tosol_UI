/** Domain models for the "đang chờ cọc" (awaiting deposit) bulk-action screen. */

export interface AwaitingDepositItem {
  id: string;
  createdAt: string;
  goodsVnd: number;
  payableVnd: number;
  quantity: number;
  productName: string;
}

export interface AwaitingDepositTotals {
  goodsVnd: number;
  payableVnd: number;
  selectedCount: number;
}
