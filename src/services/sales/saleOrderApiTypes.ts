/** Phản hồi GET /sale-orders (include theo query). */

export type SaleOrderCurrency = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_default?: boolean;
  is_active?: boolean;
};

export type SaleOrderProduct = {
  id: number;
  name: string;
  sku?: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
};

export type SaleOrderItem = {
  id: number;
  sale_order_id: number;
  product_id: number | null;
  name: string;
  sku?: string | null;
  quantity?: string | null;
  unit_price?: string | null;
  total?: string | null;
  product?: SaleOrderProduct | null;
};

export type SaleOrderShop = {
  id: number;
  name: string;
  currency?: SaleOrderCurrency | null;
};

export type SaleOrderCustomer = {
  id: number;
  name: string;
  phone: string | null;
  address?: string | null;
  full_address?: string | null;
};

export type SaleOrderCreator = {
  id: number;
  name: string;
};

export type SaleOrderSeller = {
  id: number;
  name: string;
  code?: string | null;
};

export type SaleOrderWarehouseRef = {
  id: number;
  name: string;
  code?: string | null;
  address?: string | null;
};

export type SaleOrderPackingOrder = {
  id: number;
  order_number: string;
  status?: string | null;
};

export type SaleOrderShipmentPartner = {
  name?: string | null;
  code?: string | null;
};

export type SaleOrderShipment = {
  shipping_fee?: string | null;
  status?: string | null;
  tracking_number?: string | null;
  weight?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  recipient_province?: string | null;
  recipient_district?: string | null;
  recipient_ward?: string | null;
  shipping_partner_seller?: {
    shipping_partner?: SaleOrderShipmentPartner | null;
  } | null;
};

export type SaleOrderPaymentRow = {
  id?: number;
  amount?: string | null;
  status?: string | null;
  payment_method?: string | null;
};

export type SaleOrderOutboundRow = {
  id?: number;
  order_number?: string | null;
};

/** Hóa đơn gắn đơn (khi GET include `invoice` / `invoices`). */
export type SaleOrderInvoiceRef = {
  id?: number;
  invoice_number?: string | null;
};

export type SaleOrder = {
  id: number;
  uuid: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: string;
  created_at: string;
  updated_at?: string;
  has_issue?: boolean;
  issue_reason?: string | null;
  issue_note?: string | null;
  items?: SaleOrderItem[];
  shop?: SaleOrderShop | null;
  customer?: SaleOrderCustomer | null;
  currency?: SaleOrderCurrency | null;
  creator?: SaleOrderCreator | null;
  /** Có thể có khi GET chi tiết / include đủ quan hệ. */
  shipping_fee?: string | null;
  collect_cod?: boolean;
  cod_amount?: string | null;
  order_date?: string | null;
  shipping_payer?: string | null;
  payment_method?: string | null;
  subtotal?: string | null;
  items_total?: string | null;
  discount_amount?: string | null;
  note?: string | null;
  cancel_reason?: string | null;
  seller?: SaleOrderSeller | null;
  packing_warehouse?: SaleOrderWarehouseRef | null;
  shipping_warehouse?: SaleOrderWarehouseRef | null;
  packing_order?: SaleOrderPackingOrder | null;
  shipment?: SaleOrderShipment | null;
  payments?: SaleOrderPaymentRow[] | null;
  outbound_orders?: SaleOrderOutboundRow[] | null;
  invoice_id?: number | null;
  invoice_number?: string | null;
  invoice?: SaleOrderInvoiceRef | null;
  invoices?: SaleOrderInvoiceRef[] | null;
  remaining_amount?: number | null;
  paid_amount?: number | null;
  total_paid?: number | null;
  confirmed_at?: string | null;
  packed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
};

export type SaleOrdersMeta = {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
};

export type SaleOrdersApiResponse = {
  success: boolean;
  message: string;
  data?: SaleOrder[];
  meta?: SaleOrdersMeta;
};

export type SaleOrderDetailApiResponse = {
  success: boolean;
  message: string;
  data?: SaleOrder;
};

/** POST /sale-orders — payload (theo API TOSOL). */

export type CreateSaleOrderItemPayload = {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
};

export type CreateSaleOrderShipmentPayload = {
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_province: string;
  recipient_district: string;
  recipient_ward: string;
  shipping_payer: string;
  /** Bỏ qua khi giao hàng qua đối tác không áp dụng (vd. khách tự đến lấy). */
  shipping_partner_seller_id?: number;
};

export type CreateSaleOrderPayload = {
  shop_id: number;
  warehouse_id: number;
  shipping_warehouse_id: number;
  customer_id: number;
  currency_id: number;
  discount_amount: number;
  collect_cod: boolean;
  order_date: string;
  items: CreateSaleOrderItemPayload[];
  shipment: CreateSaleOrderShipmentPayload;
  shipping_fee: number;
};

export type SaleOrderCreatedItemProduct = {
  id: number;
  sku: string;
  name: string;
  thumbnail_url: string | null;
  image_url: string | null;
};

export type SaleOrderCreatedLine = {
  id: number;
  sale_order_id: number;
  product_id: number;
  sku: string;
  name: string;
  quantity: string;
  unit_price: string;
  discount_percent: string;
  tax_rate: string;
  total: string;
  product?: SaleOrderCreatedItemProduct;
};

export type SaleOrderCreatedCustomer = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  full_address?: string | null;
};

/** `data` khi tạo đơn thành công — đủ field để UI / điều hướng. */
export type SaleOrderCreatedRecord = {
  id: number;
  uuid: string;
  order_number: string;
  secret_token: string;
  seller_id?: number;
  shop_id: number;
  packing_warehouse_id?: number;
  shipping_warehouse_id?: number;
  warehouse_id: number;
  customer_id: number;
  currency_id: number;
  status: string;
  payment_status?: string;
  total: string;
  shipping_fee: string;
  shipping_payer?: string;
  collect_cod: boolean;
  cod_amount?: string;
  order_date?: string;
  created_at?: string;
  items?: SaleOrderCreatedLine[];
  customer?: SaleOrderCreatedCustomer;
};

export type CreateSaleOrderApiResponse = {
  success: boolean;
  message: string;
  data?: SaleOrderCreatedRecord;
};
