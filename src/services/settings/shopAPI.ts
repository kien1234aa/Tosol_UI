import axios from 'axios';
import api from '@shared/services/api';
import type {
  ShopDetailApi,
  ShopDetailApiResponse,
  ShopListApiResponse,
  ShopListItem,
  ShopListPaginationMeta,
} from './shopResponseTypes';

/** POST `/api/v1/shops` — seller lấy từ token, không gửi `seller_id` trong body. */
export type CreateShopPayload = {
  name: string;
  platform: string;
  /** Chuỗi, có thể `""` (vd. sàn `manual`). */
  platform_shop_id: string;
  /** API dùng viết hoa: `FIFO`, `LIFO`, `FEFO`. */
  pick_strategy: string;
  default_payment_method: string;
  currency_id: number;
  default_price_list_id: number | null;
  auto_sync: boolean;
};

type CreateShopApiResponse = {
  success: boolean;
  message: string;
  data?: ShopListItem;
};

export type ShopListResult = {
  shops: ShopListItem[];
  meta: ShopListPaginationMeta;
};

export type ShopDirectoryQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  /** Giá trị platform từ API (vd. `manual`, `shopee`). Bỏ qua = tất cả sàn. */
  platform?: string | null;
  /** `true` / `false` = lọc theo trạng thái; bỏ qua = tất cả. */
  isActive?: boolean;
  /** Lọc theo seller (admin / chi tiết seller). */
  sellerId?: number;
  /** Vd. `currency` — bỏ qua nếu không cần. */
  include?: string;
  signal?: AbortSignal;
};

export async function getShopsForSalesMenu(): Promise<ShopListResult> {
  const response = await api.get<ShopListApiResponse>('/shops', {
    params: {
      per_page: 50,
      'filter[is_active]': true,
    },
  });
  const body = response.data;
  if (!body.success || body.data === undefined || !body.meta) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong the tai danh sach shop',
    );
  }
  return { shops: body.data, meta: body.meta };
}

/** GET `/shops/:id` — chi tiết cửa hàng. */
export async function getShopById(id: number): Promise<ShopDetailApi> {
  const response = await api.get<ShopDetailApiResponse>(`/shops/${id}`);
  const body = response.data;
  if (!body.success || body.data === undefined) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong tai duoc cua hang',
    );
  }
  return body.data;
}

/** GET `/shops` — danh sách đầy đủ (Cài đặt → Cửa hàng), có phân trang & lọc. */
export async function getShopDirectory(
  q: ShopDirectoryQuery,
): Promise<ShopListResult> {
  const params: Record<string, string | number | boolean> = {
    page: q.page ?? 1,
    per_page: q.per_page ?? 10,
  };
  const s = q.search?.trim();
  if (s) {
    params.search = s;
  }
  if (q.platform) {
    params['filter[platform]'] = q.platform;
  }
  if (q.isActive === true) {
    params['filter[is_active]'] = true;
  } else if (q.isActive === false) {
    params['filter[is_active]'] = false;
  }
  if (q.sellerId != null && Number.isFinite(q.sellerId)) {
    params['filter[seller_id]'] = q.sellerId;
  }
  const inc = q.include?.trim();
  if (inc) {
    params.include = inc;
  }
  const response = await api.get<ShopListApiResponse>('/shops', {
    params,
    signal: q.signal,
  });
  const body = response.data;
  if (!body.success || body.data === undefined || !body.meta) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong the tai danh sach shop',
    );
  }
  return { shops: body.data, meta: body.meta };
}

/** POST `/shops` — tạo cửa hàng (Cài đặt). */
export async function createShop(
  payload: CreateShopPayload,
): Promise<ShopListItem> {
  const bodyJson = {
    name: payload.name.trim(),
    platform: payload.platform,
    platform_shop_id: payload.platform_shop_id,
    pick_strategy: payload.pick_strategy.toUpperCase(),
    default_payment_method: payload.default_payment_method,
    currency_id: payload.currency_id,
    default_price_list_id: payload.default_price_list_id,
    auto_sync: payload.auto_sync,
  };
  const response = await api.post<CreateShopApiResponse>('/shops', bodyJson);
  const body = response.data;
  if (!body.success || body.data === undefined) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong tao duoc cua hang',
    );
  }
  return body.data;
}

/** PUT `/shops/:id` — cập nhật cửa hàng (không đổi `platform` / `currency_id` trong payload này). */
export type UpdateShopPayload = {
  name: string;
  platform_shop_id: string;
  pick_strategy: string;
  default_payment_method: string;
  default_price_list_id: number | null;
  auto_sync: boolean;
};

export async function updateShop(
  id: number,
  payload: UpdateShopPayload,
): Promise<ShopDetailApi> {
  const bodyJson = {
    name: payload.name.trim(),
    platform_shop_id: payload.platform_shop_id,
    pick_strategy: payload.pick_strategy.toUpperCase(),
    default_payment_method: payload.default_payment_method,
    default_price_list_id: payload.default_price_list_id,
    auto_sync: payload.auto_sync,
  };
  const response = await api.put<ShopDetailApiResponse>(
    `/shops/${id}`,
    bodyJson,
  );
  const body = response.data;
  if (!body.success || body.data === undefined) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong cap nhat duoc cua hang',
    );
  }
  return body.data;
}

/** POST `/shops/:id/deactivate` */
export async function deactivateShop(id: number): Promise<ShopDetailApi> {
  try {
    const { data } = await api.post<ShopDetailApiResponse>(
      `/shops/${id}/deactivate`,
      {},
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không vô hiệu hóa được cửa hàng',
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
    throw new Error('Không vô hiệu hóa được cửa hàng');
  }
}

/** POST `/shops/:id/activate` */
export async function activateShop(id: number): Promise<ShopDetailApi> {
  try {
    const { data } = await api.post<ShopDetailApiResponse>(
      `/shops/${id}/activate`,
      {},
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không kích hoạt được cửa hàng',
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
    throw new Error('Không kích hoạt được cửa hàng');
  }
}

/** DELETE `/shops/:id` — xóa cửa hàng. */
export async function deleteShop(id: number): Promise<void> {
  try {
    const { data } = await api.delete<unknown>(`/shops/${id}`);
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      (data as { success: boolean }).success === false
    ) {
      const m = (data as { message?: string }).message;
      throw new Error(typeof m === 'string' ? m : 'Không xóa được cửa hàng');
    }
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
    throw new Error('Không xóa được cửa hàng');
  }
}

export async function getShopList(): Promise<ShopListResult> {
  const response = await api.get<ShopListApiResponse>('/shop-context/list');
  const body = response.data;
  if (!body.success || body.data === undefined || !body.meta) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong the tai danh sach shop',
    );
  }
  return { shops: body.data, meta: body.meta };
}

export async function switchCurrentWarehouse(
  warehouseId: number,
): Promise<ShopListResult> {
  const response = await api.post<ShopListApiResponse>(
    '/warehouse-context/switch',
    {
      warehouse_id: warehouseId,
    },
  );
  const body = response.data;
  if (!body.success || body.data === undefined || !body.meta) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong the tai danh sach shop',
    );
  }
  return { shops: body.data, meta: body.meta };
}

export async function removeCurrentWarehouse(): Promise<string> {
  const response = await api.delete<ShopListApiResponse>('/warehouse-context');
  const body = response.data;
  if (!body.success || body.data === undefined || !body.meta) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong the tai danh sach shop',
    );
  }
  return body.message;
}
