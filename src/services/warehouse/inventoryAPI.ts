import axios from 'axios';
import api from '@shared/services/api';
import type {
  InventoryByProductApiResponse,
  InventoryByProductDataApi,
} from './inventoryByProductApiTypes';
import type {
  InventorySummaryApiResponse,
  InventorySummaryDataApi,
} from './inventoryApiTypes';
import type {
  InventoryListApiResponse,
  InventoryListItemApi,
  InventoryListMeta,
} from './inventoryItemsApiTypes';

/** Bộ lọc danh sách tồn theo dòng — GET `/inventory`. */
export type InventoryLinePreset =
  | 'all'
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'damaged';

export type GetInventoryItemsPageParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  preset?: InventoryLinePreset;
  warehouseId?: number | null;
  search?: string;
  /** Mặc định `product,location,warehouse,seller`. Đặt `null` để không gửi (gọi đếm nhanh). */
  include?: string | null;
  signal?: AbortSignal;
};

export type InventoryItemsPageResult = {
  items: InventoryListItemApi[];
  meta: InventoryListMeta | null;
};

const DEFAULT_INVENTORY_INCLUDE = 'product,location,warehouse,seller';

/**
 * GET `/inventory` — danh sách tồn kho theo vị trí / lô (`include` mặc định đủ nested).
 */
export async function getInventoryItemsPage(
  p: GetInventoryItemsPageParams = {},
): Promise<InventoryItemsPageResult> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    preset = 'all',
    warehouseId,
    search,
    include: includeRaw,
    signal,
  } = p;
  const include =
    includeRaw === undefined ? DEFAULT_INVENTORY_INCLUDE : includeRaw;
  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
  };
  if (include != null && include !== '') {
    params.include = include;
  }
  if (preset === 'low_stock') {
    params['filter[low_stock]'] = 1;
  } else if (preset === 'out_of_stock') {
    params['filter[out_of_stock]'] = 1;
  } else if (preset === 'expiring_soon') {
    params['filter[expiring_soon]'] = 30;
  } else if (preset === 'damaged') {
    params['filter[condition]'] = 'damaged';
  }
  if (warehouseId != null && Number.isFinite(warehouseId)) {
    params['filter[warehouse_id]'] = warehouseId;
  }
  const q = search?.trim();
  if (q) {
    params.search = q;
  }
  try {
    const { data } = await api.get<InventoryListApiResponse>('/inventory', {
      params,
      signal,
    });
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được danh sách tồn kho',
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
    throw new Error('Không tải được danh sách tồn kho');
  }
}

export type GetInventorySummaryPageParams = {
  page?: number;
  per_page?: number;
  /** `true` → gửi `low_stock=1` (chỉ hàng sắp hết). */
  low_stock?: boolean;
  signal?: AbortSignal;
};

/**
 * GET `/inventory/summary?page=&per_page=` (tùy chọn `low_stock=1`).
 */
export async function getInventorySummaryPage(
  params: GetInventorySummaryPageParams = {},
): Promise<InventorySummaryDataApi> {
  const { page = 1, per_page = 10, low_stock, signal } = params;
  const q: Record<string, string | number> = { page, per_page };
  if (low_stock) {
    q.low_stock = 1;
  }
  try {
    const { data } = await api.get<InventorySummaryApiResponse>(
      '/inventory/summary',
      {
        params: q,
        signal,
      },
    );
    if (!data.success || data.data === undefined) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được tồn kho',
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
    throw new Error('Không tải được tồn kho');
  }
}

export type GetInventorySummaryAllParams = {
  per_page?: number;
  low_stock?: boolean;
  signal?: AbortSignal;
};

/**
 * Tải toàn bộ trang summary (lặp theo `meta.last_page`) — có thể kèm `low_stock=1`.
 */
export async function getInventorySummaryAll(
  params: GetInventorySummaryAllParams = {},
): Promise<{ summary: InventorySummaryDataApi['summary']; total: number }> {
  const per_page = params.per_page ?? 10;
  const { signal, low_stock } = params;
  const first = await getInventorySummaryPage({
    page: 1,
    per_page,
    low_stock,
    signal,
  });
  const { last_page, total } = first.meta;
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, last_page - 1) }, (_, i) =>
      getInventorySummaryPage({ page: i + 2, per_page, low_stock, signal }),
    ),
  );
  const acc = [...first.summary];
  for (const chunk of remainingPages) {
    acc.push(...chunk.summary);
  }
  return { summary: acc, total };
}

/**
 * Chi tiết tồn kho theo sản phẩm — GET `/inventory/by-product/{id}?include=product,warehouse,location`
 */
export async function getInventoryByProduct(
  productId: number,
  params: { signal?: AbortSignal } = {},
): Promise<InventoryByProductDataApi> {
  const { signal } = params;
  try {
    const { data } = await api.get<InventoryByProductApiResponse>(
      `/inventory/by-product/${productId}`,
      {
        params: { include: 'product,warehouse,location' },
        signal,
      },
    );
    if (!data.success || data.data === undefined) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được chi tiết tồn kho',
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
    throw new Error('Không tải được chi tiết tồn kho');
  }
}
