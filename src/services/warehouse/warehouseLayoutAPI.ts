import axios from 'axios';
import api from '@shared/services/api';
import type {
  WarehouseRackViewApiResponse,
  WarehouseRackViewData,
} from '@services/warehouse/warehouseLayoutApiTypes';

/**
 * GET `/warehouses/{warehouseCode}/layout/rack-view` — sơ đồ rack theo mã kho.
 */
export async function getWarehouseRackView(
  warehouseCode: string,
  signal?: AbortSignal,
): Promise<WarehouseRackViewData> {
  const code = warehouseCode.trim();
  if (!code) {
    throw new Error('Thiếu mã kho');
  }
  const path = `/warehouses/${encodeURIComponent(code)}/layout/rack-view`;
  try {
    const { data } = await api.get<WarehouseRackViewApiResponse>(path, {
      signal,
    });
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được sơ đồ kho',
      );
    }
    return data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không tải được sơ đồ kho');
  }
}
