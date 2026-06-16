export type TransferOrderRowStatus =
  | 'pending'
  | 'in_transit'
  | 'receiving'
  | 'completed'
  | 'cancelled'
  | 'other';

export type TransferOrderListRow = {
  id: number;
  uuid: string | null;
  orderNumber: string;
  rowStatus: TransferOrderRowStatus;
  statusLabel: string;
  routeLabel: string;
  creatorName: string;
  driverLine: string;
  linkedOrdersLabel: string;
  productLabel: string;
  productThumb: string | null;
  scanProgressLabel: string;
  qtyWeightLabel: string;
  noteSnippet: string;
  createdAtLabel: string;
};
