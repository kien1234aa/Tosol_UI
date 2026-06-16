/** Tiền tệ kèm `include=priceList.currency`. */
export type ProductPriceCurrencyApi = {
  id: number;
  code: string;
  name?: string;
  symbol: string;
  decimal_places?: number;
};

/** Bảng giá kèm `include=priceList` / `priceList.currency`. */
export type ProductPricePriceListApi = {
  id: number;
  name: string;
  code: string;
  is_default?: boolean;
  is_active?: boolean;
  currency?: ProductPriceCurrencyApi | null;
};

/** Sản phẩm kèm theo `include=product`. */
export type ProductPriceProductApi = {
  id: number;
  uuid?: string;
  sku?: string | null;
  name?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  is_active?: boolean;
};

/** Phần tử GET `/product-prices`. */
export type ProductPriceApi = {
  id: number;
  price_list_id: number;
  product_id: number;
  price: string | number | null;
  min_quantity?: number | string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  product?: ProductPriceProductApi | null;
  price_list?: ProductPricePriceListApi | null;
};

export type ProductPricesMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type ProductPricesApiResponse = {
  success: boolean;
  message?: string;
  data?: ProductPriceApi[];
  meta?: ProductPricesMeta;
};
