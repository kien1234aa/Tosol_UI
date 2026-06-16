/** Sản phẩm nhúng trong từng dòng tồn theo lô (include=product). */
export type InventoryByProductNestedProductApi = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  thumbnail_url?: string | null;
  image_url?: string | null;
};

export type InventoryWarehouseNestedApi = {
  id: number;
  code?: string | null;
  name: string;
  address?: string | null;
};

export type InventoryLocationNestedApi = {
  id: number;
  name?: string | null;
  code?: string | null;
} | null;

export type InventoryPurchaseOrderNestedApi = {
  order_number?: string | null;
} | null;

export type InventoryInboundOrderNestedApi = {
  id: number;
  order_number?: string | null;
  purchase_order?: InventoryPurchaseOrderNestedApi;
};

export type InventoryInboundOrderItemNestedApi = {
  id: number;
  inbound_order?: InventoryInboundOrderNestedApi | null;
} | null;

export type InventoryByProductItemApi = {
  id: number;
  warehouse_id: number;
  product_id: number;
  location_id: number | null;
  condition: string;
  quantity: number;
  unit: string;
  reserved_quantity: number;
  available_quantity: number;
  expiry_date: string | null;
  received_at: string | null;
  product: InventoryByProductNestedProductApi;
  warehouse: InventoryWarehouseNestedApi;
  location: InventoryLocationNestedApi;
  inbound_order_item: InventoryInboundOrderItemNestedApi;
};

export type InventoryByProductSummaryApi = {
  total_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  locations_count: number;
};

export type InventoryByProductMetaApi = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type InventoryByProductDataApi = {
  items: InventoryByProductItemApi[];
  summary: InventoryByProductSummaryApi;
  meta: InventoryByProductMetaApi;
};

export type InventoryByProductApiResponse = {
  success: boolean;
  message: string;
  data?: InventoryByProductDataApi;
};
