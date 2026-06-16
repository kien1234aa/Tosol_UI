/** GET `/outbound-orders` — phản hồi Laravel / TOSOL. */

export type OutboundOrdersMeta = {
  current_page: number;
  from?: number | null;
  last_page: number;
  per_page: number;
  to?: number | null;
  total: number;
};

export type OutboundOrderWarehouseApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type OutboundOrderSellerApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type OutboundOrderProductNestedApi = {
  id?: number;
  name?: string | null;
  sku?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
};

export type OutboundOrderItemApi = {
  id?: number;
  outbound_order_id?: number;
  product_id?: number | null;
  sku?: string | null;
  quantity?: number | string | null;
  picked_quantity?: number | string | null;
  remaining_quantity?: number | string | null;
  pick_status?: string | null;
  pick_progress?: number | null;
  is_fully_picked?: boolean | null;
  product?: OutboundOrderProductNestedApi | null;
};

export type OutboundOrderSaleOrderApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
  total?: string | number | null;
};

export type OutboundOrderTransferOrderApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
};

export type OutboundOrderSourceOutboundApi = {
  id?: number;
  order_number?: string | null;
  warehouse?: OutboundOrderWarehouseApi | null;
};

export type OutboundOrderReviewerApi = {
  id?: number;
  name?: string | null;
};

/** Hộp trong `packing_order` lồng GET chi tiết xuất kho. */
export type OutboundNestedPackingBoxItemApi = {
  id?: number;
  sku?: string | null;
  quantity?: string | number | null;
  picked_quantity?: string | number | null;
  packed_quantity?: string | number | null;
  status?: string | null;
};

export type OutboundNestedPackingBoxApi = {
  id?: number;
  box_code?: string | null;
  box_number?: number | null;
  status?: string | null;
  tracking_number?: string | null;
  actual_weight?: string | number | null;
  items?: OutboundNestedPackingBoxItemApi[] | null;
  box_template?: unknown | null;
};

export type OutboundNestedPackingSummaryApi = {
  total_boxes?: number | null;
  packed_boxes?: number | null;
  pending_boxes?: number | null;
  handed_over_boxes?: number | null;
};

export type OutboundNestedPackingOrderApi = {
  id?: number;
  uuid?: string | null;
  order_number?: string | null;
  status?: string | null;
  box_count?: number | null;
  summary?: OutboundNestedPackingSummaryApi | null;
  boxes?: OutboundNestedPackingBoxApi[] | null;
};

export type OutboundOrderApi = {
  id: number;
  uuid?: string | null;
  order_number?: string | null;
  seller_id?: number | null;
  warehouse_id?: number | null;
  destination_warehouse_id?: number | null;
  type?: string | null;
  status?: string | null;
  sale_order_id?: number | null;
  transfer_order_id?: number | null;
  source_outbound_order_id?: number | null;
  note?: string | null;
  request_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  picked_at?: string | null;
  packed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  total_quantity?: number | string | null;
  total_picked_quantity?: number | string | null;
  is_fully_picked?: boolean | null;
  pick_progress?: number | null;
  requires_packing?: boolean | null;
  is_transfer?: boolean | null;
  is_return?: boolean | null;
  is_disposal?: boolean | null;
  can_cancel?: boolean | null;
  can_edit?: boolean | null;
  next_allowed_statuses?: string[] | null;
  recipient_name?: string | null;
  recipient_type?: string | null;
  shipping_partner_name?: string | null;
  shipping_partner?: unknown | null;
  handover_mode?: string | null;
  handover_started_at?: string | null;
  is_handover_started?: boolean | null;
  is_handover_completed?: boolean | null;
  completed_at?: string | null;
  shipped_at?: string | null;
  items?: OutboundOrderItemApi[] | null;
  warehouse?: OutboundOrderWarehouseApi | null;
  destination_warehouse?: OutboundOrderWarehouseApi | null;
  seller?: OutboundOrderSellerApi | null;
  reviewer?: OutboundOrderReviewerApi | null;
  sale_order?: OutboundOrderSaleOrderApi | null;
  transfer_order?: OutboundOrderTransferOrderApi | null;
  source_outbound_order?: OutboundOrderSourceOutboundApi | null;
  packing_order?: OutboundNestedPackingOrderApi | null;
};

/** GET `/outbound-orders/{orderNumber}` — một bản ghi. */
export type OutboundOrderDetailApiResponse = {
  success: boolean;
  message?: string | null;
  data?: OutboundOrderApi | null;
};

export type OutboundOrdersApiResponse = {
  success: boolean;
  message?: string | null;
  data: OutboundOrderApi[] | { data?: OutboundOrderApi[] } | null;
  meta?: OutboundOrdersMeta | null;
};

/** POST `/outbound-orders` — tạo phiếu xuất kho thủ công (kho / loại / dòng hàng). */
export type CreateOutboundOrderItemPayload = {
  product_id: number;
  quantity: number | string;
};

export type CreateOutboundOrderPayload = {
  warehouse_id: number;
  /** Slug loại xuất — backend TOSOL (vd. `balance_transfer`, `disposal`). */
  type: string;
  destination_warehouse_id?: number | null;
  note?: string | null;
  items: CreateOutboundOrderItemPayload[];
};

export type OutboundOrderCreateApiResponse = {
  success: boolean;
  message?: string | null;
  data?: OutboundOrderApi | null;
};
