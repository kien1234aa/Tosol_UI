export interface WarehouseCounters {
  inbound_pending: number;
  packing_pending: number;
  outbound_pending: number;
  staging_ready: number;
  transfer_pending: number;
  shipments_failed: number;
  shipments_in_transit: number;
  disposal_pending: number;
  outbound_awaiting_transfer: number;
  transfer_awaiting_handover: number;
  returns_pending: number;
  combo_assemblies_pending: number;
}

export interface SellerCounters {
  orders_pending: number;
  orders_confirmed: number;
  orders_processing: number;
  orders_ready_to_ship: number;
  orders_issue: number;
  returns_pending: number;
  purchase_awaiting: number;
  invoices_unpaid: number;
  shipments_failed: number;
  shipments_in_transit: number;
  settlements_pending: number;
}

export interface UserCounters {
  unread_notifications: number;
}

export interface CountersData {
  warehouse: WarehouseCounters;
  seller: SellerCounters;
  user: UserCounters;
}
