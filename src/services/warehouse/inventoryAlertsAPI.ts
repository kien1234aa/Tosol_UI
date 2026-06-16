import axios from 'axios';
import api from '@shared/services/api';
import type {
  InventoryAlertListItemApi,
  InventoryAlertsListApiResponse,
  InventoryAlertsListMeta,
} from '@services/warehouse/inventoryAlertsApiTypes';

/** Khớp `alert_types[]` trong payload — gửi `filter[alert_type]` nếu API hỗ trợ. */
export type InventoryAlertTypeFilter =
  | 'all'
  | 'out_of_stock'
  | 'low_stock'
  | 'near_expiry';

export type GetInventoryAlertsPageParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  alertType?: InventoryAlertTypeFilter;
  warehouseId?: number | null;
  signal?: AbortSignal;
};

export type InventoryAlertsPageResult = {
  items: InventoryAlertListItemApi[];
  meta: InventoryAlertsListMeta | null;
};

/**
 * GET `/inventory/alerts` — danh sách cảnh báo tồn kho.
 */
export async function getInventoryAlertsPage(
  p: GetInventoryAlertsPageParams = {},
): Promise<InventoryAlertsPageResult> {
  const {
    page = 1,
    per_page = 20,
    sort = '-updated_at',
    alertType = 'all',
    warehouseId,
    signal,
  } = p;
  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
  };
  if (alertType !== 'all') {
    params['filter[alert_type]'] = alertType;
  }
  if (warehouseId != null && Number.isFinite(warehouseId)) {
    params['filter[warehouse_id]'] = warehouseId;
  }
  try {
    const { data } = await api.get<InventoryAlertsListApiResponse>(
      '/inventory/alerts',
      {
        params,
        signal,
      },
    );
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được cảnh báo tồn kho',
      );
    }
    return { items: data.data, meta: data.meta ?? null };
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
    throw new Error('Không tải được cảnh báo tồn kho');
  }
}
