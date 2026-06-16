/** GET `/purchase-orders` — phản hồi (khớp kiểu Laravel / TOSOL). */

export type PurchaseOrdersMeta = {
  current_page: number;
  from?: number | null;
  last_page: number;
  per_page: number;
  to?: number | null;
  total: number;
};

export type PurchaseOrderSupplierApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type PurchaseOrderWarehouseApi = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type PurchaseOrderProductNestedApi = {
  id?: number;
  name?: string | null;
  sku?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
};

export type PurchaseOrderItemApi = {
  id?: number;
  purchase_order_id?: number;
  product_id?: number;
  sku?: string | null;
  name?: string | null;
  /** Số lượng đặt (API dùng `quantity`, không phải `expected_quantity`). */
  quantity?: number | string | null;
  unit?: string | null;
  received_quantity?: number | string | null;
  unit_price?: string | number | null;
  total?: string | number | null;
  product?: PurchaseOrderProductNestedApi | null;
  /** Một số bản có thể có thêm (tùy API). */
  expected_quantity?: number | string | null;
};

export type PurchaseOrderCurrencyApi = {
  id?: number;
  code?: string | null;
  name?: string | null;
  symbol?: string | null;
  decimal_places?: number | null;
};

export type PurchaseOrderAttachmentUploaderApi = {
  id?: number;
  name?: string | null;
  email?: string | null;
};

export type PurchaseOrderAttachmentApi = {
  id: number;
  original_name?: string | null;
  file_name?: string | null;
  url?: string | null;
  mime_type?: string | null;
  size?: number | string | null;
  created_at?: string | null;
  uploader?: PurchaseOrderAttachmentUploaderApi | null;
};

export type PurchaseOrderInboundApi = {
  id?: number;
  uuid?: string | null;
  order_number?: string | null;
  status?: string | null;
  warehouse_id?: number | null;
  purchase_order_id?: number | null;
  note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PurchaseOrderApi = {
  id: number;
  uuid?: string | null;
  seller_id?: number | null;
  warehouse_id?: number | null;
  supplier_id?: number | null;
  currency_id?: number | null;
  order_number?: string | null;
  status?: string | null;
  total?: string | null;
  note?: string | null;
  expected_at?: string | null;
  received_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  tracking_number?: string | null;
  supplier?: PurchaseOrderSupplierApi | null;
  warehouse?: PurchaseOrderWarehouseApi | null;
  currency?: PurchaseOrderCurrencyApi | null;
  items?: PurchaseOrderItemApi[] | null;
  total_expected_quantity?: number | null;
  total_received_quantity?: number | null;
  is_fully_received?: boolean | null;
  /** Đơn nhập kho kèm theo (API snake `inbound_orders`). */
  inbound_orders?: PurchaseOrderInboundApi[] | null;
  /** Chứng từ đính kèm — `include=attachments,attachments.uploader`. */
  attachments?: PurchaseOrderAttachmentApi[] | null;
};

export type PurchaseOrdersApiResponse = {
  success: boolean;
  message: string;
  data?:
    | PurchaseOrderApi[]
    | { data?: PurchaseOrderApi[]; meta?: PurchaseOrdersMeta };
  meta?: PurchaseOrdersMeta;
};

/** POST/PUT/PATCH `/purchase-orders` — dòng hàng (API v2 Forge: `quantity` thường là chuỗi thập phân). */
export type CreatePurchaseOrderItemPayload = {
  product_id: number;
  quantity: number | string;
  unit_price: number;
};

/**
 * POST `/purchase-orders` — tối thiểu: `warehouse_id` + `items`.
 * `supplier_id` / `currency_id` và các trường khác tùy API (có thể bỏ hoặc null).
 */
export type CreatePurchaseOrderPayload = {
  warehouse_id: number;
  items: CreatePurchaseOrderItemPayload[];
  supplier_id?: number | null;
  currency_id?: number | null;
  expected_at?: string | null;
  tracking_number?: string | null;
  note?: string | null;
};

export type CreatePurchaseOrderApiResponse = {
  success: boolean;
  message: string;
  data?: PurchaseOrderApi;
};

/** PUT `/purchase-orders/{ref}` — cùng cấu trúc thân với POST tạo đơn (theo REST thông dụng). */
export type UpdatePurchaseOrderPayload = CreatePurchaseOrderPayload;

export type PurchaseOrderDetailApiResponse = {
  success: boolean;
  message: string;
  data?: PurchaseOrderApi;
};

/** POST `/purchase-orders/{ref}/cancel` */
export type CancelPurchaseOrderPayload = {
  reason: string;
};
