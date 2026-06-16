export type ShipmentsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type ShipmentPartnerRef = {
  id?: number;
  name?: string | null;
  logo_url?: string | null;
  code?: string | null;
};

export type ShipmentCurrencyRef = {
  symbol?: string;
  decimal_places?: number;
};

export type ShipmentSaleOrderNested = {
  id: number;
  order_number: string;
  currency?: ShipmentCurrencyRef | null;
};

/** Phần tử GET /shipments (include theo query). */
export type ShipmentRecord = {
  id: number;
  uuid?: string;
  status?: string;
  tracking_number?: string | null;
  cod_amount?: string | null;
  shipping_fee?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  created_at?: string;
  sale_order?: ShipmentSaleOrderNested | null;
  saleOrder?: ShipmentSaleOrderNested | null;
  shipping_partner_seller?: {
    shipping_partner?: ShipmentPartnerRef | null;
  } | null;
  shippingPartnerSeller?: {
    shippingPartner?: ShipmentPartnerRef | null;
  } | null;
  shipping_partner_warehouse?: {
    shipping_partner_config?: {
      shipping_partner?: ShipmentPartnerRef | null;
    } | null;
  } | null;
  shippingPartnerWarehouse?: {
    shippingPartnerConfig?: {
      shippingPartner?: ShipmentPartnerRef | null;
    } | null;
  } | null;
  /** Mã đối tác khi chưa có `shipping_partner_seller` (vd. `ghn`, `best-express`). */
  shipping_partner_code?: string | null;
  shippingPartnerCode?: string | null;
};

export type ShipmentsListApiResponse = {
  success: boolean;
  message: string;
  data?: ShipmentRecord[];
  meta?: ShipmentsListMeta;
};
