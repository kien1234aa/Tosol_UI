/** Sentinel value for "all warehouses" in API and app state. */
export const ALL_WAREHOUSES_ID = 0;

export function isAllWarehouses(
  warehouseId: number | null | undefined,
): boolean {
  return warehouseId == null || warehouseId === ALL_WAREHOUSES_ID;
}

export function normalizeWarehouseId(
  warehouseId: number | null | undefined,
): number {
  return isAllWarehouses(warehouseId) ? ALL_WAREHOUSES_ID : warehouseId;
}

export function isSameWarehouseSelection(
  left: number | null | undefined,
  right: number | null | undefined,
): boolean {
  return normalizeWarehouseId(left) === normalizeWarehouseId(right);
}
