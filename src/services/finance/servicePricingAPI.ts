import axios from 'axios';
import api from '@shared/services/api';
import type {
  CreateServicePricingApiResponse,
  CreateServicePricingPayload,
  ServicePricingListItemApi,
  ServicePricingsListApiResponse,
  ServicePricingsListMeta,
} from '@services/finance/servicePricingApiTypes';

export type GetServicePricingsParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  search?: string;
  isActive?: boolean;
  /** Lọc theo seller (admin / chi tiết seller). */
  sellerId?: number;
  signal?: AbortSignal;
};

export type ServicePricingsPageResult = {
  items: ServicePricingListItemApi[];
  meta: ServicePricingsListMeta | null;
};

const DEFAULT_INCLUDE = 'currency,seller,warehouse,toWarehouse';

/**
 * GET `/service-pricings` — danh sách bảng giá dịch vụ (Tài chính).
 */
export async function getServicePricingsPage(
  p: GetServicePricingsParams = {},
): Promise<ServicePricingsPageResult> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include = DEFAULT_INCLUDE,
    search,
    isActive,
    signal,
  } = p;
  const params: Record<string, string | number | boolean> = {
    page,
    per_page,
    sort,
    include,
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
  if (p.sellerId != null && Number.isFinite(p.sellerId)) {
    params['filter[seller_id]'] = p.sellerId;
  }
  try {
    const { data } = await api.get<ServicePricingsListApiResponse>(
      '/service-pricings',
      {
        params,
        signal,
      },
    );
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được bảng giá dịch vụ',
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
    throw new Error('Không tải được bảng giá dịch vụ');
  }
}

/** POST `/service-pricings` — tạo bảng giá dịch vụ mới. */
export async function createServicePricing(
  payload: CreateServicePricingPayload,
): Promise<ServicePricingListItemApi> {
  const body: Record<string, unknown> = {
    seller_id: payload.seller_id,
    currency_id: payload.currency_id,
    service_type: payload.service_type.trim(),
    name: payload.name.trim(),
    price: payload.price,
    unit: payload.unit.trim(),
    is_active: payload.is_active ?? true,
    min_quantity: payload.min_quantity ?? 1,
  };
  if (payload.warehouse_id != null) {
    body.warehouse_id = payload.warehouse_id;
  }
  if (payload.to_warehouse_id != null) {
    body.to_warehouse_id = payload.to_warehouse_id;
  }
  const desc = payload.description?.trim();
  if (desc) {
    body.description = desc;
  }
  if (payload.max_quantity != null) {
    body.max_quantity = payload.max_quantity;
  }
  if (payload.effective_from) {
    body.effective_from = payload.effective_from;
  }
  if (payload.effective_to) {
    body.effective_to = payload.effective_to;
  }

  try {
    const { data } = await api.post<CreateServicePricingApiResponse>(
      '/service-pricings',
      body,
    );
    if (!data.success || !data.data) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được bảng giá dịch vụ',
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
    throw new Error('Không tạo được bảng giá dịch vụ');
  }
}
