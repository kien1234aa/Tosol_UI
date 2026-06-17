/** Raw API models for catalog products. */

export interface ProductSellerApi {
  id: number;
  uuid: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  tax_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImageApi {
  id: number;
  product_id: number;
  original_url: string;
  thumbnail_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  file_size: number;
  file_size_human: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductApiItem {
  id: number;
  uuid: string;
  seller_id: number;
  sku: string;
  name: string;
  description: string | null;
  barcode: string | null;
  unit: string;
  price: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  image_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_combo: boolean;
  created_at: string;
  updated_at: string;
  volumetric_weight: number;
  total_stock: string;
  available_stock: string;
  reserved_stock: string;
  warehouses_count: number;
  min_stock: string | null;
  is_in_stock: boolean;
  is_low_stock: boolean;
  is_below_min_stock: boolean;
  is_out_of_stock: boolean;
}

export interface ProductDetailApiItem extends ProductApiItem {
  seller?: ProductSellerApi;
  images?: ProductImageApi[];
  primary_image?: ProductImageApi | null;
  recipe_items?: unknown[];
}

export interface ProductsPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ProductsListResult {
  products: ProductApiItem[];
  meta: ProductsPaginationMeta;
}
