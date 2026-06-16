export type InventoryAlertsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type InventoryAlertProductApi = {
  id: number;
  sku: string;
  name: string;
  barcode: string | null;
};

export type InventoryAlertSellerApi = {
  id: number;
  name: string;
  code: string;
};

export type InventoryAlertWarehouseApi = {
  id: number;
  name: string;
  code: string;
};

export type InventoryAlertLocationApi = {
  id?: number;
  code?: string;
  name?: string;
} | null;

export type InventoryAlertListItemApi = {
  id: number;
  uuid: string;
  product: InventoryAlertProductApi;
  seller: InventoryAlertSellerApi;
  warehouse: InventoryAlertWarehouseApi;
  location: InventoryAlertLocationApi;
  quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  condition: string;
  expiry_date: string | null;
  alert_types: string[];
  alert_severity: string;
  low_stock_threshold: number | null;
  received_at: string;
  created_at: string;
  updated_at: string;
};

export type InventoryAlertsListApiResponse = {
  success: boolean;
  message?: string;
  data?: InventoryAlertListItemApi[];
  meta?: InventoryAlertsListMeta;
};
