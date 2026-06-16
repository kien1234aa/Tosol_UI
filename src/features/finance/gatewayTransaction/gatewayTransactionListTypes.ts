export type GatewayTxnListFilter =
  | 'all'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

/** Loại giao dịch cổng — gửi `filter[type]` khi khác `all`. */
export type GatewayTxnListTypeFilter = 'all' | 'payment' | 'refund';

export type GatewayTxnRowStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'unknown';

export type GatewayTxnListRow = {
  id: string;
  detailRef: string;
  providerName: string;
  orderRef: string;
  amountDisplay: string;
  status: GatewayTxnRowStatus;
  statusLabel: string;
  typeLabel: string;
  createdLabel: string;
};
