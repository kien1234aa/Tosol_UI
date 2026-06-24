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
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_combo: boolean;
  created_at: string;
  updated_at: string;
  /** Có trên list; có thể không có trên GET chi tiết. */
  volumetric_weight?: number;
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
  recipe_items?: ProductRecipeItemApi[];
}

export interface ProductRecipeItemApi {
  id?: number;
  product_id?: number;
  component_product_id?: number;
  quantity?: string | number;
  component?: {
    id?: number;
    sku?: string;
    name?: string;
  } | null;
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

/** POST /products — thành phần combo khi `is_combo: true`. */
export interface CreateProductRecipeItemPayload {
  component_product_id: number;
  quantity: number;
}

/** PUT /products/{id} — body JSON (khớp API TOSOL v2). */
export interface UpdateProductPayload {
  sku: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  /** API nhận chuỗi thập phân, vd. `"100.00"`. */
  min_stock: string;
  is_active: boolean;
}

/** POST /products — body JSON. */
export interface CreateProductPayload {
  seller_id: number;
  sku: string;
  name: string;
  description: string;
  barcode: string;
  price: number;
  unit: string;
  min_stock: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  is_active: boolean;
  is_combo: boolean;
  image_url: string;
  recipe_items?: CreateProductRecipeItemPayload[];
}

/** Sản phẩm thành phần trong form tạo combo. */
export interface CreateProductComboRow {
  rowId: string;
  productId: number | null;
  sku: string;
  name: string;
  unit: string;
  unitLabel: string;
  thumbnailUrl: string | null;
  quantity: string;
}

/** GET /products/suggestions */
export interface ProductSuggestionApiItem {
  id: number;
  sku: string;
  name: string;
  barcode: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  price: string;
  unit: string;
  available_stock: string;
  warehouse_available_stock?: number;
}

export interface ProductSuggestionItem {
  id: number;
  sku: string;
  name: string;
  unit: string;
  unitLabel: string;
  thumbnailUrl: string | null;
  priceVnd: number;
  availableStock: number;
  isOutOfStock: boolean;
}

/** Ảnh chọn từ thiết bị (react-native-image-picker). */
export interface CreateProductImagePart {
  uri: string;
  type: string;
  name: string;
}

export interface ProductListItem {
  id: number;
  uuid: string;
  sku: string;
  name: string;
  priceVnd: number;
  unit: string;
  unitLabel: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  availableStock: number;
  isInStock: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface CreateProductFormValues {
  sku: string;
  name: string;
  barcode: string;
  price: string;
  unit: string;
  minStock: string;
  description: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  isActive: boolean;
  isCombo: boolean;
}

export type CreateProductValidationErrors = Partial<
  Record<'sku' | 'name' | 'price' | 'comboItems', string>
>;

/** Product detail view model for the profile tab. */
export interface ProfileProductDetailImage {
  id: number;
  originalUrl: string;
  thumbnailUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  mimeType: string;
  fileSizeHuman: string;
}

export interface ProfileProductDetailSeller {
  id: number;
  uuid: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  taxNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileProductDetailRecipeItem {
  id: number | null;
  quantity: string | null;
  componentName: string | null;
  componentSku: string | null;
}

export interface ProfileProductDetail {
  id: number;
  uuid: string;
  sellerId: number;
  name: string;
  description: string | null;
  sku: string;
  unit: string;
  unitLabel: string;
  barcode: string | null;
  priceRaw: string;
  priceVnd: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  isCombo: boolean;
  createdAt: string;
  updatedAt: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  warehousesCount: number;
  minStock: number | null;
  isInStock: boolean;
  isLowStock: boolean;
  isBelowMinStock: boolean;
  isOutOfStock: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  volumetricWeight: number | null;
  seller: ProfileProductDetailSeller | null;
  images: ProfileProductDetailImage[];
  primaryImage: ProfileProductDetailImage | null;
  recipeItems: ProfileProductDetailRecipeItem[];
}
