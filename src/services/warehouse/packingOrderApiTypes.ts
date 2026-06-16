/** GET `/packing-orders` — phản hồi Laravel / TOSOL. */

export type PackingOrdersMeta = {
  current_page: number;
  from?: number | null;
  last_page: number;
  per_page: number;
  to?: number | null;
  total: number;
};

export type PackingOrderWarehouseApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type PackingOrderSellerApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type PackingOrderProductNestedApi = {
  id?: number;
  name?: string | null;
  sku?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
};

export type PackingOrderSaleOrderItemApi = {
  id?: number;
  product_id?: number | null;
  name?: string | null;
  sku?: string | null;
  quantity?: string | number | null;
  product?: PackingOrderProductNestedApi | null;
};

export type PackingOrderSaleOrderApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
  items?: PackingOrderSaleOrderItemApi[] | null;
};

export type PackingOrderAssignedUserApi = {
  id?: number;
  name?: string | null;
};

export type PackingOrderStagingLocationApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

/** Đơn xuất kho (khi API gắn kèm). */
export type PackingOrderOutboundOrderApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
};

export type PackingOrderBoxItemApi = {
  id?: number;
  sku?: string | null;
  quantity?: string | number | null;
  picked_quantity?: string | number | null;
  packed_quantity?: string | number | null;
  status?: string | null;
  pick_progress?: number | null;
  pack_progress?: number | null;
  product_name?: string | null;
  product_thumbnail?: string | null;
  product_unit?: string | null;
  good_quantity?: number | null;
  remaining_to_pick?: number | null;
  remaining_to_pack?: number | null;
  product?: PackingOrderProductNestedApi | null;
};

export type PackingOrderBoxApi = {
  id?: number;
  box_code?: string | null;
  box_number?: number | null;
  status?: string | null;
  pending_unpack?: boolean | null;
  total_items_quantity?: number | null;
  pick_progress?: number | null;
  items?: PackingOrderBoxItemApi[] | null;
};

export type PackingOrderSummaryApi = {
  total_boxes?: number | null;
  packed_boxes?: number | null;
  pending_boxes?: number | null;
  handed_over_boxes?: number | null;
};

export type PackingOrderApi = {
  id: number;
  uuid?: string | null;
  order_number?: string | null;
  seller_id?: number | null;
  warehouse_id?: number | null;
  sale_order_id?: number | null;
  status?: string | null;
  assigned_user_id?: number | null;
  note?: string | null;
  has_pending_unpack?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  total_weight?: number | string | null;
  box_count?: number | null;
  total_items?: number | null;
  total_required_quantity?: number | string | null;
  total_picked_quantity?: number | string | null;
  pick_progress?: number | null;
  packing_progress?: number | null;
  summary?: PackingOrderSummaryApi | null;
  boxes?: PackingOrderBoxApi[] | null;
  warehouse?: PackingOrderWarehouseApi | null;
  seller?: PackingOrderSellerApi | null;
  sale_order?: PackingOrderSaleOrderApi | null;
  assigned_user?: PackingOrderAssignedUserApi | null;
  staging_location_id?: number | null;
  staging_location?: PackingOrderStagingLocationApi | null;
  outbound_order?: PackingOrderOutboundOrderApi | null;
  assigned_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
};

/** GET `/packing-orders/{orderNumber}` — một bản ghi. */
export type PackingOrderDetailApiResponse = {
  success: boolean;
  message?: string | null;
  data?: PackingOrderApi | null;
};

export type PackingOrdersApiResponse = {
  success: boolean;
  message?: string | null;
  data: PackingOrderApi[] | { data?: PackingOrderApi[] } | null;
  meta?: PackingOrdersMeta | null;
};
