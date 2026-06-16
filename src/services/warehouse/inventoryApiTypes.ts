export type InventoryProductApi = {
  id: number;
  sku: string;
  name: string;
  thumbnail_url: string | null;
  image_url?: string | null;
  unit: string;
  min_stock: number | null;
};

export type InventorySummaryItemApi = {
  product_id: number;
  product: InventoryProductApi;
  total_quantity: number;
  total_reserved: number;
  total_available: number;
};

export type InventorySummaryMetaApi = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type InventorySummaryDataApi = {
  summary: InventorySummaryItemApi[];
  meta: InventorySummaryMetaApi;
};

export type InventorySummaryApiResponse = {
  success: boolean;
  message: string;
  data?: InventorySummaryDataApi;
};
