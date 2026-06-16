/** Meta phân trang — GET `/inventory`. */
export type InventoryListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type InventoryListProductInclude = {
  id: number;
  sku: string;
  name: string;
  unit?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  min_stock?: number | null;
  is_low_stock?: boolean;
  is_out_of_stock?: boolean;
};

export type InventoryListWarehouseInclude = {
  id: number;
  name: string;
  code: string;
};

export type InventoryListLocationInclude = {
  id?: number;
  name?: string;
  code?: string;
} | null;

export type InventoryListSellerInclude = {
  id: number;
  name: string;
  code: string;
};

/** Phần tử `data[]` — GET `/inventory?include=product,location,warehouse,seller`. */
export type InventoryListItemApi = {
  id: number;
  uuid: string;
  seller_id: number;
  warehouse_id: number;
  product_id: number;
  location_id: number | null;
  condition: string;
  quantity: number;
  unit: string;
  reserved_quantity: number;
  available_quantity: number;
  expiry_date: string | null;
  is_expired: boolean;
  days_until_expiry?: number | null;
  product: InventoryListProductInclude;
  location: InventoryListLocationInclude;
  warehouse: InventoryListWarehouseInclude;
  seller?: InventoryListSellerInclude;
};

export type InventoryListApiResponse = {
  success: boolean;
  message?: string;
  data?: InventoryListItemApi[];
  meta?: InventoryListMeta;
};
