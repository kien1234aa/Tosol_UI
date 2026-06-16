/** GET /warehouses/{code}/shipping-partners — phần tử `data[]` */

export type ShippingPartnerNestedApi = {
  id: number;
  code: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
};

export type CurrencyNestedApi = {
  id: number;
  code: string;
  name: string;
  symbol: string;
};

export type ShippingPartnerConfigNestedApi = {
  id: number;
  description: string;
  currency_id: number | null;
  is_active: boolean;
  shipping_partner: ShippingPartnerNestedApi;
  currency: CurrencyNestedApi | null;
};

export type WarehouseShippingPartnerApi = {
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
  service_id: string | null;
  effective_service_id: string | null;
  lat: string | null;
  lng: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shipping_partner_config: ShippingPartnerConfigNestedApi;
};

export type WarehouseShippingPartnersApiResponse = {
  success: boolean;
  message: string;
  data?: WarehouseShippingPartnerApi[];
  meta: unknown;
};

/** GET /shipping-partner-sellers?include=shippingPartner&… — phần tử `data[]` (seller ↔ đối tác VC) */

export type SellerShippingPartnerNestedApi = {
  id: number;
  code: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  supported_services: unknown;
  credentials_schema: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type SellerShippingPartnerApi = {
  id: number;
  seller_id: number;
  shipping_partner_id: number;
  default_service: string | null;
  is_active: boolean;
  credentials: Record<string, string> | null;
  shipping_partner: SellerShippingPartnerNestedApi;
  created_at: string;
  updated_at: string;
};

export type SellerShippingPartnersListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type SellerShippingPartnersApiResponse = {
  success: boolean;
  message: string;
  data?: SellerShippingPartnerApi[];
  meta?: SellerShippingPartnersListMeta;
};

/** Một trường trong `credentials_schema` — GET `/shipping-partners`. */
export type ShippingPartnerCredentialFieldSchemaApi = {
  type?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
};

/**
 * Phần tử `data[]` — GET `/api/v1/shipping-partners` (danh mục đối tác nền, quản trị).
 */
export type ShippingPartnerCatalogApi = {
  id: number;
  code: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  supported_services: unknown;
  credentials_schema: Record<
    string,
    ShippingPartnerCredentialFieldSchemaApi
  > | null;
  driver: string | null;
  api_config: {
    credentials_schema?: Record<
      string,
      ShippingPartnerCredentialFieldSchemaApi
    > | null;
  } | null;
  configs_count: number;
  seller_configs_count: number;
  warehouse_configs_count: number;
  created_at: string;
  updated_at: string;
};

export type ShippingPartnersCatalogApiResponse = {
  success: boolean;
  message: string;
  data?: ShippingPartnerCatalogApi[];
  meta?: SellerShippingPartnersListMeta;
};

/** POST `/shipping-partners` — tạo đối tác nền (quản trị). */
export type CreateShippingPartnerPayload = {
  code: string;
  name: string;
  /** Driver tích hợp (vd. `ghn`, `best-express`); để trống thì backend có thể mặc định theo `code`. */
  driver?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
};

export type CreateShippingPartnerApiResponse = {
  success: boolean;
  message?: string | null;
  data?:
    | ShippingPartnerCatalogApi
    | { data?: ShippingPartnerCatalogApi }
    | null;
};

/** Nested `shipping_partner` — GET `/shipping-partner-configs?include=shippingPartner`. */
export type ShippingPartnerConfigNestedPartnerApi = {
  id: number;
  code: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  driver?: string | null;
  supported_services?: unknown;
  credentials_schema?: Record<
    string,
    ShippingPartnerCredentialFieldSchemaApi
  > | null;
  api_config?: ShippingPartnerCatalogApi['api_config'];
  created_at?: string;
  updated_at?: string;
};

export type ShippingPartnerConfigNestedCurrencyApi = {
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

/** Phần tử `data[]` — GET `/shipping-partner-configs?include=shippingPartner,currency`. */
export type ShippingPartnerConfigListItemApi = {
  id: number;
  shipping_partner_id: number;
  description: string;
  currency_id: number | null;
  default_service_id: string | null;
  is_active: boolean;
  /** API có thể trả object hoặc mảng rỗng. */
  credentials: Record<string, unknown> | unknown[];
  warehouse_configs_count: number;
  shipping_partner: ShippingPartnerConfigNestedPartnerApi | null;
  currency: ShippingPartnerConfigNestedCurrencyApi | null;
  created_at: string;
  updated_at: string;
};

export type ShippingPartnerConfigsListApiResponse = {
  success: boolean;
  message: string;
  data?: ShippingPartnerConfigListItemApi[];
  meta?: SellerShippingPartnersListMeta;
};

/** POST `/shipping-partner-configs` — tạo cấu hình (admin). */
export type CreateShippingPartnerConfigPayload = {
  shipping_partner_id: number;
  description: string;
  currency_id?: number | null;
  is_active?: boolean;
  credentials?: Record<string, string>;
};

export type CreateShippingPartnerConfigApiResponse = {
  success: boolean;
  message?: string | null;
  data?:
    | ShippingPartnerConfigListItemApi
    | { data?: ShippingPartnerConfigListItemApi }
    | null;
};

/** POST `/shipping-partner-sellers/:id/test` — `data` lồng kết quả kiểm tra. */

export type SellerShippingPartnerTestInner = {
  success: boolean;
  message: string;
  tested_at?: string;
};

export type SellerShippingPartnerTestApiResponse = {
  success: boolean;
  message: string;
  data?: SellerShippingPartnerTestInner;
};

export type WarehouseShippingPartnerSelectOption = {
  value: number;
  label: string;
  subtitle?: string;
};

export function toWarehouseShippingPartnerSelectOption(
  row: WarehouseShippingPartnerApi,
): WarehouseShippingPartnerSelectOption {
  const sp = row.shipping_partner_config?.shipping_partner;
  const partnerName = sp?.name?.trim() || 'Đối tác';
  const desc = (
    row.description ||
    row.shipping_partner_config?.description ||
    ''
  ).trim();
  const label =
    desc && desc !== partnerName ? `${partnerName} — ${desc}` : partnerName;
  const subtitleParts = [row.pickup_name, row.pickup_address].filter(Boolean);
  const subtitle =
    subtitleParts.length > 0
      ? subtitleParts.join(' · ')
      : sp?.code ?? undefined;
  return { value: row.id, label, subtitle };
}

const lc = (s: string | undefined | null) => s?.trim().toLowerCase() ?? '';

/**
 * Đối tác của seller chỉ dùng Best Express — chọn dòng từ API
 * (`shipping_partner.code === best-express` hoặc tên gần đúng).
 */
export function findBestExpressPartnerRow(
  rows: WarehouseShippingPartnerApi[],
): WarehouseShippingPartnerApi | null {
  if (rows.length === 0) {
    return null;
  }
  const byCode = rows.find(
    r =>
      lc(r.shipping_partner_config?.shipping_partner?.code) === 'best-express',
  );
  if (byCode) {
    return byCode;
  }
  const byName = rows.find(r => {
    const n = lc(r.shipping_partner_config?.shipping_partner?.name);
    return n.includes('best') && n.includes('express');
  });
  return byName ?? null;
}

/**
 * Best Express trên danh sách đối tác theo seller (`shipping_partner` lồng trực tiếp).
 */
export function findBestExpressSellerPartnerRow(
  rows: SellerShippingPartnerApi[],
): SellerShippingPartnerApi | null {
  if (rows.length === 0) {
    return null;
  }
  const byCode = rows.find(
    r => lc(r.shipping_partner?.code) === 'best-express',
  );
  if (byCode) {
    return byCode;
  }
  const byName = rows.find(r => {
    const n = lc(r.shipping_partner?.name);
    return n.includes('best') && n.includes('express');
  });
  return byName ?? null;
}

/** Nested trong GET `/shipping-rates` — `data[].shipping_partner_config`. */
export type ShippingRatePartnerRefApi = {
  code: string;
  name: string;
};

export type ShippingRateConfigNestedApi = {
  id: number;
  shipping_partner: ShippingRatePartnerRefApi;
};

/** Phần tử `data[]` — GET `/shipping-rates`. */
export type ShippingRateListItemApi = {
  id: number;
  shipping_partner_config: ShippingRateConfigNestedApi;
  name: string;
  service_type: string | null;
  warehouse: unknown | null;
  seller: unknown | null;
  weight_range: {
    min: number;
    max: number | null;
    unit: string;
  };
  pricing: {
    base_price: number;
    base_weight: number;
    additional_price_per_kg: number;
    currency: string;
  };
  fees: {
    cod_fee_percentage: number;
    cod_fee_min: number;
    cod_fee_max: number | null;
    insurance_fee_percentage: number;
    remote_area_surcharge: number;
  };
  effective_period: {
    from: string | null;
    to: string | null;
  };
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ShippingRatesListApiResponse = {
  success: boolean;
  message: string;
  data?: ShippingRateListItemApi[];
  meta?: SellerShippingPartnersListMeta;
};

/** POST /shipping-rates/estimate-cost */

export type ShippingRateEstimateItem = {
  product_id: number;
  quantity: number;
};

export type ShippingRateEstimatePayload = {
  to_province: string;
  to_district: string;
  to_ward: string;
  items: ShippingRateEstimateItem[];
  /**
   * Theo backend: với đối tác theo kho — `shipping_partner_config_id` của dòng kho;
   * với đối tác theo seller — `id` của bản ghi trong GET /shipping-partner-sellers (seller–shipping-partner).
   */
  shipping_partner_seller_id: number;
  warehouse_id: number;
};

export type ShippingEstimateBreakdown = {
  service_type?: string;
  freight_fee?: number;
  freight_fee_vat?: number;
  cod_fee?: number;
  cod_fee_vat?: number;
  insurance_fee?: number;
  insurance_fee_vat?: number;
  total_before_discount?: number;
  discount?: number;
};

export type ShippingEstimateData = {
  shipping_fee: number;
  cod_fee: number;
  insurance_fee: number;
  remote_area_surcharge: number;
  total_fee: number;
  discount: number;
  currency_code: string;
  breakdown: ShippingEstimateBreakdown;
  source: string;
};

export type ShippingEstimateApiResponse = {
  success: boolean;
  message: string;
  data?: ShippingEstimateData;
};
