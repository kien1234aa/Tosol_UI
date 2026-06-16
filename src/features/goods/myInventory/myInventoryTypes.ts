import type { InventoryLinePreset } from '@services/warehouse/inventoryAPI';

/** Bộ lọc danh sách — GET `/inventory` (`filter[…]`). */
export type InventoryStockPreset = InventoryLinePreset;

/** Dòng từ GET `/inventory` (một bản ghi tồn theo lô / vị trí). */
export type InventoryLineRow = {
  inventoryId: number;
  productId: number;
  name: string;
  /** Mã SKU — null nếu không có. */
  sku: string | null;
  /** Đơn vị — null nếu không có. */
  unitLabel: string | null;
  quantity: number;
  reserved: number;
  available: number;
  imageUrl: string | null;
  /** Tên kho — null nếu không có. */
  warehouseName: string | null;
  /** Vị trí / lô — null nếu không có. */
  locationLabel: string | null;
  condition: string;
  expiryDate: string | null;
  isExpired: boolean;
  productIsLowStock: boolean;
  productIsOutOfStock: boolean;
  minStock: number | null;
};

/** Tổng hợp theo sản phẩm (legacy `inventory/summary`). */
export type InventoryRow = {
  id: number;
  name: string;
  /** Mã SKU — null nếu không có. */
  sku: string | null;
  /** Đơn vị — null nếu không có. */
  unit: string | null;
  onHand: number;
  reserved: number;
  available: number;
  imageUrl?: string | null;
  /** Ngưỡng từ API (`min_stock`); khi có thì «sắp hết» so với ngưỡng này. */
  minStock?: number | null;
};
