/** GET `/inbound-orders` — phản hồi Laravel / TOSOL. */

export type InboundOrdersMeta = {
  current_page: number;
  from?: number | null;
  last_page: number;
  per_page: number;
  to?: number | null;
  total: number;
};

export type InboundOrderWarehouseApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type InboundOrderSellerApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type InboundOrderSupplierApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type InboundOrderProductNestedApi = {
  id?: number;
  name?: string | null;
  sku?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
};

/** Dòng trên đơn mua (lồng trong phiếu nhập chi tiết). */
export type InboundNestedPurchaseOrderItemApi = {
  id?: number;
  sku?: string | null;
  name?: string | null;
  quantity?: string | number | null;
  received_quantity?: string | number | null;
  unit?: string | null;
  product?: InboundOrderProductNestedApi | null;
};

export type InboundOrderPurchaseOrderApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
  total?: string | number | null;
  note?: string | null;
  tracking_number?: string | null;
  expected_at?: string | null;
  received_at?: string | null;
  cancelled_at?: string | null;
  supplier?: InboundOrderSupplierApi | null;
  items?: InboundNestedPurchaseOrderItemApi[] | null;
};

export type InboundOrderSaleOrderApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
};

export type InboundOrderTransferOrderApi = {
  id?: number;
  order_number?: string | null;
  status?: string | null;
};

export type InboundOrderReceiveLocationApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type InboundOrderReceiveApi = {
  id?: number;
  quantity?: number | string | null;
  good_quantity?: number | string | null;
  damaged_quantity?: number | string | null;
  received_at?: string | null;
  location?: InboundOrderReceiveLocationApi | null;
};

export type InboundOrderItemApi = {
  id?: number;
  inbound_order_id?: number;
  product_id?: number | null;
  sku?: string | null;
  expected_quantity?: number | string | null;
  received_quantity?: number | string | null;
  good_quantity?: number | string | null;
  damaged_quantity?: number | string | null;
  status?: string | null;
  product?: InboundOrderProductNestedApi | null;
  receives?: InboundOrderReceiveApi[] | null;
};

export type InboundOrderApi = {
  id: number;
  uuid?: string | null;
  order_number?: string | null;
  seller_id?: number | null;
  warehouse_id?: number | null;
  type?: string | null;
  status?: string | null;
  purchase_order_id?: number | null;
  sale_order_id?: number | null;
  transfer_order_id?: number | null;
  note?: string | null;
  received_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  total_expected_quantity?: number | string | null;
  total_received_quantity?: number | string | null;
  total_damaged_quantity?: number | string | null;
  is_fully_received?: boolean | null;
  items?: InboundOrderItemApi[] | null;
  warehouse?: InboundOrderWarehouseApi | null;
  seller?: InboundOrderSellerApi | null;
  purchase_order?: InboundOrderPurchaseOrderApi | null;
  sale_order?: InboundOrderSaleOrderApi | null;
  transfer_order?: InboundOrderTransferOrderApi | null;
};

/** GET `/inbound-orders/{orderNumber}` — một bản ghi. */
export type InboundOrderDetailApiResponse = {
  success: boolean;
  message?: string | null;
  data?: InboundOrderApi | null;
};

export type InboundOrdersApiResponse = {
  success: boolean;
  message?: string | null;
  data: InboundOrderApi[] | { data?: InboundOrderApi[] } | null;
  meta?: InboundOrdersMeta | null;
};
