/** Sản phẩm kèm theo `include=product`. */
export type ProductShopMappingProductApi = {
  id: number;
  uuid?: string;
  sku?: string | null;
  name?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  is_active?: boolean;
};

/** Phần tử GET `/product-shop-mappings`. */
export type ProductShopMappingApi = {
  id: number;
  shop_id: number;
  product_id: number;
  platform_product_id?: string | null;
  platform_sku?: string | null;
  platform_item_id?: string | null;
  external_id?: string | null;
  is_active?: boolean | null;
  sync_status?: string | null;
  last_synced_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  product?: ProductShopMappingProductApi | null;
};

export type ProductShopMappingsMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type ProductShopMappingsApiResponse = {
  success: boolean;
  message?: string;
  data?: ProductShopMappingApi[];
  meta?: ProductShopMappingsMeta;
};
