/** `data.summary` — GET `/warehouses/{code}/layout/rack-view`. */
export type WarehouseRackViewSummary = {
  total_locations: number;
  occupied_locations: number;
  empty_locations: number;
  active_locations: number;
  inactive_locations: number;
  total_items: number;
  total_quantity: string;
  total_products: number;
  occupancy_rate: number;
};

export type WarehouseRackViewWarehouse = {
  id: number;
  code: string;
  name: string;
};

/** Một rack — backend có thể mở rộng; giữ linh hoạt cho lưới sau này. */
export type WarehouseRackViewRack = Record<string, unknown>;

export type WarehouseRackViewData = {
  warehouse: WarehouseRackViewWarehouse;
  summary: WarehouseRackViewSummary;
  racks: WarehouseRackViewRack[];
};

export type WarehouseRackViewApiResponse = {
  success: boolean;
  message?: string;
  data?: WarehouseRackViewData;
};
