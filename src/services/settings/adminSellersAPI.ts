import axios from 'axios';
import api from '@shared/services/api';
import type {
  AdminSellersListMeta,
  SellerDetailApi,
  SellerDetailApiResponse,
  SellerListItemApi,
  SellersListApiResponse,
} from './adminSellersApiTypes';

export type GetSellersParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  search?: string;
  isActive?: boolean;
  signal?: AbortSignal;
};

export type SellersPageResult = {
  items: SellerListItemApi[];
  meta: AdminSellersListMeta | null;
};

/**
 * GET `/sellers` — danh sách người bán (admin).
 */
export async function getSellersPage(
  p: GetSellersParams = {},
): Promise<SellersPageResult> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    search,
    isActive,
    signal,
  } = p;
  const params: Record<string, string | number | boolean> = {
    page,
    per_page,
    sort,
  };
  const q = search?.trim();
  if (q) {
    params.search = q;
  }
  if (isActive === true) {
    params['filter[is_active]'] = 1;
  } else if (isActive === false) {
    params['filter[is_active]'] = 0;
  }
  try {
    const { data } = await api.get<SellersListApiResponse>('/sellers', {
      params,
      signal,
    });
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được danh sách người bán',
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
    throw new Error('Không tải được danh sách người bán');
  }
}

/**
 * GET `/sellers/{code}` — `sellerRef` là mã (vd. `USE000001`).
 */
export async function getSellerDetail(
  sellerRef: string,
  signal?: AbortSignal,
): Promise<SellerDetailApi> {
  const ref = sellerRef.trim();
  if (!ref) {
    throw new Error('Thiếu người bán');
  }
  try {
    const { data } = await api.get<SellerDetailApiResponse>(
      `/sellers/${encodeURIComponent(ref)}`,
      {
        signal,
      },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được người bán',
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
    throw new Error('Không tải được người bán');
  }
}
