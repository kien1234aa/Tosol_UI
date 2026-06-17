/** POST /sale-orders — request & response types. */

export interface CreateSaleOrderItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
}

export interface CreateSaleOrderShipmentPayload {
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_province: string;
  recipient_district: string;
  recipient_ward: string;
  shipping_payer: string;
  shipping_partner_seller_id?: number;
}

export interface CreateSaleOrderPayload {
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
}

export interface SaleOrderCreatedRecord {
  id: number;
  uuid: string;
  order_number: string;
  secret_token: string;
  shop_id: number;
  warehouse_id: number;
  customer_id: number;
  currency_id: number;
  status: string;
  payment_status?: string;
  total: string;
  shipping_fee: string;
  shipping_payer?: string;
  collect_cod: boolean;
  order_date?: string;
  created_at?: string;
}

/** GET /sale-orders — list item shapes. */

export interface SaleOrderProductApi {
  id: number;
  name: string;
  sku?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
}

export interface SaleOrderItemApi {
  id: number;
  sale_order_id: number;
  product_id: number | null;
  name: string;
  sku?: string | null;
  quantity?: string | null;
  unit_price?: string | null;
  total?: string | null;
  product?: SaleOrderProductApi | null;
}

export interface SaleOrderShopApi {
  id: number;
  name: string;
}

export interface SaleOrderCustomerApi {
  id: number;
  name: string;
  phone?: string | null;
}

export interface SaleOrderCreatorApi {
  id: number;
  name: string;
}

export interface SaleOrderApiItem {
  id: number;
  uuid: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: string;
  shipping_fee?: string | null;
  created_at: string;
  updated_at?: string;
  paid_amount?: number | null;
  total_paid?: number | null;
  remaining_amount?: number | null;
  items?: SaleOrderItemApi[];
  shop?: SaleOrderShopApi | null;
  customer?: SaleOrderCustomerApi | null;
  creator?: SaleOrderCreatorApi | null;
}

export interface SaleOrderListParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  hasIssue?: boolean;
  dateFrom?: string;
  dateTo?: string;
  shopId?: number;
}

/** GET /sale-orders/{orderRef} — detail response (partial). */

export interface SaleOrderWarehouseApi {
  id: number;
  code?: string | null;
  name: string;
  address?: string | null;
}

export interface SaleOrderShippingPartnerApi {
  id: number;
  code: string;
  name: string;
  logo_url?: string | null;
}

export interface SaleOrderShippingPartnerSellerApi {
  id: number;
  shipping_partner?: SaleOrderShippingPartnerApi | null;
}

export interface SaleOrderShipmentApi {
  id: number;
  status: string;
  shipping_fee?: string | null;
  cod_amount?: string | null;
  collect_cod?: boolean;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  recipient_province?: string | null;
  recipient_district?: string | null;
  recipient_ward?: string | null;
  tracking_number?: string | null;
  shipping_partner_seller?: SaleOrderShippingPartnerSellerApi | null;
}

export interface SaleOrderPackingOrderApi {
  id: number;
  order_number: string;
  status: string;
}

export interface UpdateSaleOrderPayload {
  note?: string;
}

export interface SaleOrderDetailApi extends SaleOrderApiItem {
  order_date?: string | null;
  payment_method?: string | null;
  items_total?: string | null;
  subtotal?: string | null;
  discount_amount?: string | null;
  tax_amount?: string | null;
  shipping_fee?: string | null;
  shipping_payer?: string | null;
  collect_cod?: boolean;
  cod_amount?: string | null;
  note?: string | null;
  has_issue?: boolean;
  issue_note?: string | null;
  packing_warehouse?: SaleOrderWarehouseApi | null;
  shipping_warehouse?: SaleOrderWarehouseApi | null;
  warehouse?: SaleOrderWarehouseApi | null;
  shipment?: SaleOrderShipmentApi | null;
  packing_order?: SaleOrderPackingOrderApi | null;
  customer?: SaleOrderCustomerApi & {
    email?: string | null;
    address?: string | null;
    full_address?: string | null;
  } | null;
}
