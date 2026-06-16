/** GET `/transfer-orders` — phản hồi Laravel / TOSOL. */

export type TransferOrdersMeta = {
  current_page: number;
  from?: number | null;
  last_page: number;
  per_page: number;
  to?: number | null;
  total: number;
};

export type TransferOrderWarehouseApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type TransferOrderCreatorApi = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export type TransferOrderSaleOrderRefApi = {
  id?: number;
  order_number?: string | null;
};

export type TransferOrderOutboundItemApi = {
  id?: number;
  sku?: string | null;
  product_id?: number | null;
  quantity?: number | string | null;
  picked_quantity?: number | string | null;
  pick_progress?: number | null;
  pick_status?: string | null;
  is_fully_picked?: boolean | null;
};

export type TransferOrderShippingPartnerRefApi = {
  code?: string | null;
  name?: string | null;
  logo_url?: string | null;
};

export type TransferOrderOutboundNestedApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
  type?: string | null;
  total_quantity?: number | string | null;
  pick_progress?: number | null;
  shipping_partner_name?: string | null;
  shipping_partner?: TransferOrderShippingPartnerRefApi | null;
  sale_order?: TransferOrderSaleOrderRefApi | null;
  items?: TransferOrderOutboundItemApi[] | null;
};

export type TransferOrderInboundNestedApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
  type?: string | null;
};

export type TransferOrderApi = {
  id: number;
  uuid?: string | null;
  order_number?: string | null;
  from_warehouse_id?: number | null;
  to_warehouse_id?: number | null;
  status?: string | null;
  created_by?: number | null;
  note?: string | null;
  shipped_at?: string | null;
  received_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  total_quantity?: number | string | null;
  total_items?: number | string | null;
  total_weight?: number | string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  vehicle_number?: string | null;
  handover_note?: string | null;
  handover_started_at?: string | null;
  handover_completed_at?: string | null;
  handover_by?: number | null;
  can_cancel?: boolean | null;
  is_handover_started?: boolean | null;
  is_handover_completed?: boolean | null;
  can_start_handover?: boolean | null;
  total_boxes_count?: number | null;
  scanned_boxes_count?: number | null;
  total_items_count?: number | null;
  total_items_quantity?: number | string | null;
  scanned_items_quantity?: number | string | null;
  fully_scanned_items_count?: number | null;
  received_boxes_count?: number | null;
  received_items_quantity?: number | string | null;
  received_damaged_quantity?: number | string | null;
  received_lost_quantity?: number | string | null;
  fully_received_items_count?: number | null;
  outbound_orders_count?: number | null;
  inbound_orders_count?: number | null;
  from_warehouse?: TransferOrderWarehouseApi | null;
  to_warehouse?: TransferOrderWarehouseApi | null;
  creator?: TransferOrderCreatorApi | null;
  outbound_orders?: TransferOrderOutboundNestedApi[] | null;
  inbound_orders?: TransferOrderInboundNestedApi[] | null;
};

/** GET `/transfer-orders/{orderNumber}` — một bản ghi. */
export type TransferOrderDetailApiResponse = {
  success: boolean;
  message?: string | null;
  data?: TransferOrderApi | null;
};

export type TransferOrdersApiResponse = {
  success: boolean;
  message?: string | null;
  data: TransferOrderApi[] | { data?: TransferOrderApi[] } | null;
  meta?: TransferOrdersMeta | null;
};
