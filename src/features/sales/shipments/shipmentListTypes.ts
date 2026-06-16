export type ShipmentRowStatus =
  | 'pending'
  | 'created'
  | 'picking'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivering'
  | 'delivered'
  | 'failed_delivery'
  | 'returning'
  | 'returned'
  | 'cancelled'
  | 'lost'
  | 'damaged'
  | 'unknown';

export type ShipmentListRow = {
  key: string;
  orderNumber: string;
  partnerName: string;
  partnerLogoUrl: string | null;
  status: ShipmentRowStatus;
  recipientName: string;
  recipientPhone: string;
  recipientAddressShort: string;
  codDisplay: string;
  feeDisplay: string;
  createdAtDisplay: string;
};
