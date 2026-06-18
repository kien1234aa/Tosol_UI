/** Models for POST /shipping-rates/estimate-cost. */

export interface ShippingRateEstimateItem {
  product_id: number;
  quantity: number;
}

export interface ShippingRateEstimateBasePayload {
  to_province: string;
  to_district: string;
  to_ward: string;
  items: ShippingRateEstimateItem[];
}

/** POST /shipping-rates/estimate-cost when shipping method is warehouse partner (kho tự ship). */
export interface WarehouseShippingRateEstimatePayload
  extends ShippingRateEstimateBasePayload {
  shipping_partner_warehouse_id: number;
  cod_amount: number;
}

/** POST /shipping-rates/estimate-cost when shipping method is seller partner. */
export interface SellerShippingRateEstimatePayload
  extends ShippingRateEstimateBasePayload {
  shipping_partner_seller_id: number;
  warehouse_id: number;
}

export type ShippingRateEstimatePayload =
  | WarehouseShippingRateEstimatePayload
  | SellerShippingRateEstimatePayload;

export interface ShippingEstimateBreakdown {
  base_price?: number;
  base_weight?: number;
  actual_weight?: number;
  additional_weight?: number;
  additional_price_per_kg?: number;
  cod_fee_percentage?: number;
  insurance_fee_percentage?: number;
  service_type?: string;
  freight_fee?: number;
  freight_fee_vat?: number;
  cod_fee?: number;
  cod_fee_vat?: number;
  insurance_fee?: number;
  insurance_fee_vat?: number;
  total_before_discount?: number;
  discount?: number;
}

export interface ShippingEstimateData {
  shipping_fee: number;
  cod_fee: number;
  insurance_fee: number;
  remote_area_surcharge: number;
  total_fee: number;
  discount?: number;
  currency_code: string;
  breakdown: ShippingEstimateBreakdown;
  rate_id?: number;
  source: string;
}

export interface SellerShippingPartnerApiItem {
  id: number;
  seller_id: number;
  shipping_partner_id: number;
  default_service: string | null;
  is_active: boolean;
  shipping_partner: {
    id: number;
    code: string;
    name: string;
    logo_url: string | null;
    is_active: boolean;
  };
}
