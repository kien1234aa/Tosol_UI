import type { AuthUser } from '@/src/types/login/auth.types';

export function getActiveWarehouses(user: AuthUser | null) {
  return user?.warehouses.filter(warehouse => warehouse.is_active) ?? [];
}

export function getDefaultWarehouseId(user: AuthUser | null): number | null {
  const activeWarehouses = getActiveWarehouses(user);
  if (activeWarehouses.length === 0) {
    return null;
  }

  if (user?.currentWarehouseId) {
    const currentWarehouse = activeWarehouses.find(
      warehouse => warehouse.id === user.currentWarehouseId,
    );
    if (currentWarehouse) {
      return currentWarehouse.id;
    }
  }

  return activeWarehouses[0].id;
}
