import { deleteJson, postJson } from '@/src/apis/http';
import {
  ALL_WAREHOUSES_ID,
  isAllWarehouses,
  normalizeWarehouseId,
} from '@/src/configs/warehouse';
import { apiEndpoints } from '@/src/configs/api';
import type {
  SwitchWarehouseApiData,
  SwitchWarehouseResult,
} from '@/src/types/warehouse';

export interface IWarehouseService {
  switchContext(warehouseId: number | null): Promise<SwitchWarehouseResult>;
}

function mapSwitchWarehouseResponse(
  data: SwitchWarehouseApiData,
): SwitchWarehouseResult {
  return {
    currentWarehouseId: normalizeWarehouseId(data.current_warehouse_id),
    currentWarehouse: data.current_warehouse,
  };
}

function mapClearWarehouseResponse(): SwitchWarehouseResult {
  return {
    currentWarehouseId: ALL_WAREHOUSES_ID,
    currentWarehouse: null,
  };
}

class HttpWarehouseService implements IWarehouseService {
  async switchContext(
    warehouseId: number | null,
  ): Promise<SwitchWarehouseResult> {
    if (isAllWarehouses(warehouseId)) {
      await deleteJson(apiEndpoints.warehouseContext);
      return mapClearWarehouseResponse();
    }

    const data = await postJson<SwitchWarehouseApiData>(
      apiEndpoints.switchWarehouseContext,
      { warehouse_id: warehouseId },
    );

    return mapSwitchWarehouseResponse(data);
  }
}

export const warehouseService: IWarehouseService = new HttpWarehouseService();
