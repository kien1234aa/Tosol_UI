import type { AuthWarehouse } from '@/src/types/login/auth.types';

export interface SwitchWarehouseApiData {
  current_warehouse_id: number | null;
  current_warehouse: AuthWarehouse | null;
}

export interface SwitchWarehouseResult {
  currentWarehouseId: number | null;
  currentWarehouse: AuthWarehouse | null;
}
