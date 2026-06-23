import type { AuthWarehouse } from '@/src/types/login/auth.types';

function isWarehouseActive(
  warehouse: Pick<AuthWarehouse, 'is_active'> | null | undefined,
): boolean {
  return warehouse != null && warehouse.is_active !== false;
}

/** Normalize API warehouse rows; keep entries unless explicitly inactive. */
export function normalizeAuthWarehouses(
  warehouses: AuthWarehouse[] | null | undefined,
): AuthWarehouse[] {
  return (warehouses ?? [])
    .filter(warehouse => Number.isFinite(warehouse.id))
    .map(warehouse => ({
      ...warehouse,
      is_active: warehouse.is_active !== false,
    }))
    .filter(isWarehouseActive);
}
