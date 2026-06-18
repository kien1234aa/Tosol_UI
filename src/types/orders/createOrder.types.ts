/** Domain models for the create-order modal. */

export interface ShopApiItem {
  id: number;
  uuid: string;
  seller_id: number;
  name: string;
  platform: string;
  platform_shop_id: string | null;
  pick_strategy: string;
  default_payment_method: string;
  online_payment_method: string | null;
  seller_payment_gateway_id: number | null;
  default_bank_account_id: number | null;
  default_shipping_partner_seller_id: number | null;
  currency_id: number;
  default_price_list_id: number | null;
  is_active: boolean;
  auto_sync: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerWarehouseApiItem {
  id: number;
  uuid: string;
  code: string;
  name: string;
  address: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  phone: string;
  email: string | null;
  is_active: boolean;
  location_management_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderSelectOption {
  id: number;
  label: string;
  subtitle?: string;
  /** Id sent to POST /shipping-rates/estimate-cost (seller or warehouse partner row id). */
  estimatePartnerId?: number;
}

export type CreateOrderShippingMethod =
  | 'seller_partner'
  | 'warehouse_partner'
  | 'customer_pickup';

export interface CreateOrderFormState {
  shopId: number | null;
  packagingWarehouseId: number | null;
  customerId: number | null;
  shippingMethod: CreateOrderShippingMethod;
  warehousePartnerId: number | null;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
  isCodEnabled: boolean;
  isAdvancedOpen: boolean;
}

export interface CreateOrderModalContext {
  groupId?: string;
}

export interface CustomerApiItem {
  id: number;
  uuid: string;
  seller_id: number;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  province: unknown;
  district: unknown;
  ward: unknown;
  full_address: string;
  created_at: string;
  updated_at: string;
  sale_orders_count: number;
}

export interface CustomerSearchResult {
  id: number;
  name: string;
  phone: string;
  /** Địa chỉ đường/số nhà (không gồm tỉnh/quận/phường). */
  address: string;
  fullAddress: string;
  email: string | null;
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
}

export interface WarehouseShippingPartnerApiItem {
  id: number;
  shipping_partner_config_id: number;
  shipping_partner_id: number;
  warehouse_id: number;
  description: string;
  pickup_address: string;
  pickup_phone: string;
  pickup_name: string;
  pickup_province: string | null;
  pickup_district: string | null;
  pickup_ward: string | null;
  service_id: number | null;
  effective_service_id: number | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shipping_partner_config: {
    id: number;
    description: string;
    currency_id: number | null;
    is_active: boolean;
    shipping_partner: {
      id: number;
      code: string;
      name: string;
      logo_url: string | null;
      is_active: boolean;
    };
  };
}
