import axios from 'axios';
import api from '@shared/services/api';
import type {
  LocationListItemApi,
  LocationsListApiResponse,
  LocationsListMeta,
} from '@services/warehouse/locationsApiTypes';

export type LocationTypeFilter = 'all' | 'storage' | 'picking' | 'staging';

export type GetLocationsParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  search?: string;
  /** Mặc định `warehouse`. Đặt `null` để không gửi `include` (gọi đếm nhanh). */
  include?: string | null;
  type?: LocationTypeFilter;
  signal?: AbortSignal;
};

export type LocationsPageResult = {
  items: LocationListItemApi[];
  meta: LocationsListMeta | null;
};

/**
 * GET `/locations` — danh sách vị trí kho (`include=warehouse` mặc định).
 */
export async function getLocationsPage(
  p: GetLocationsParams = {},
): Promise<LocationsPageResult> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    search,
    include: includeRaw,
    type = 'all',
    signal,
  } = p;
  const include = includeRaw === undefined ? 'warehouse' : includeRaw;
  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
  };
  if (include != null && include !== '') {
    params.include = include;
  }
  const q = search?.trim();
  if (q) {
    params.search = q;
  }
  if (type !== 'all') {
    params['filter[type]'] = type;
  }
  try {
    const { data } = await api.get<LocationsListApiResponse>('/locations', {
      params,
      signal,
    });
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được danh sách vị trí kho',
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
    throw new Error('Không tải được danh sách vị trí kho');
  }
}
