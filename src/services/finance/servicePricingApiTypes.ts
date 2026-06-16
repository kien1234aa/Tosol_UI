/** GET `/service-pricings` — meta phân trang. */
export type ServicePricingsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type ServicePricingNestedRefApi = {
  id: number;
  name: string;
  code: string;
};

export type ServicePricingCurrencyApi = {
  id: number;
  code: string;
  name: string;
  symbol?: string | null;
  exchange_rate?: string;
  decimal_places?: number;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

/** Phần tử `data[]` — GET `/service-pricings?include=…`. */
export type ServicePricingListItemApi = {
  id: number;
  seller_id: number;
  warehouse_id: number | null;
  to_warehouse_id: number | null;
  currency_id: number;
  service_type: string;
  service_type_label: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  unit_label: string;
  min_quantity: number;
  max_quantity: number | null;
  is_active: boolean;
  effective_from: string | null;
  effective_to: string | null;
  is_currently_effective: boolean;
  created_at: string;
  updated_at: string;
  seller: ServicePricingNestedRefApi | null;
  warehouse: ServicePricingNestedRefApi | null;
  to_warehouse: ServicePricingNestedRefApi | null;
  currency: ServicePricingCurrencyApi | null;
};

export type ServicePricingsListApiResponse = {
  success: boolean;
  message: string;
  data?: ServicePricingListItemApi[];
  meta?: ServicePricingsListMeta;
};

export type CreateServicePricingPayload = {
  seller_id: number;
  warehouse_id?: number | null;
  to_warehouse_id?: number | null;
  currency_id: number;
  service_type: string;
  name: string;
  description?: string | null;
  price: number;
  unit: string;
  min_quantity?: number;
  max_quantity?: number | null;
  is_active?: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
};

export type CreateServicePricingApiResponse = {
  success: boolean;
  message?: string;
  data?: ServicePricingListItemApi;
};
