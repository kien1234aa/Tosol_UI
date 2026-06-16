import axios from 'axios';
import api from '@shared/services/api';
import type {
  SellerShippingPartnerApi,
  SellerShippingPartnerNestedApi,
  SellerShippingPartnersApiResponse,
  SellerShippingPartnerTestApiResponse,
  SellerShippingPartnerTestInner,
  SellerShippingPartnersListMeta,
  ShippingEstimateApiResponse,
  ShippingEstimateData,
  CreateShippingPartnerApiResponse,
  CreateShippingPartnerConfigApiResponse,
  CreateShippingPartnerConfigPayload,
  CreateShippingPartnerPayload,
  ShippingPartnerCatalogApi,
  ShippingPartnerConfigListItemApi,
  ShippingPartnerConfigsListApiResponse,
  ShippingPartnersCatalogApiResponse,
  ShippingRateEstimatePayload,
  ShippingRatesListApiResponse,
  ShippingRateListItemApi,
  WarehouseShippingPartnerApi,
  WarehouseShippingPartnersApiResponse,
} from './shipApiTypes';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function strOrNull(v: unknown): string | null {
  if (v == null) {
    return null;
  }
  if (typeof v === 'string') {
    return v;
  }
  return String(v);
}

function normalizeCredentials(v: unknown): Record<string, string> | null {
  const o = asRecord(v);
  if (!o) {
    return null;
  }
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(o)) {
    if (typeof val === 'string') {
      out[k] = val;
    } else if (val != null && typeof val !== 'object') {
      out[k] = String(val);
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

function normalizeSellerShippingPartnerNested(
  raw: Record<string, unknown>,
): SellerShippingPartnerNestedApi | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  const logo = strOrNull(raw.logo_url) ?? strOrNull(raw.logoUrl);
  const credSchema =
    asRecord(raw.credentials_schema) ?? asRecord(raw.credentialsSchema);
  return {
    id,
    code: String(raw.code ?? ''),
    name: String(raw.name ?? ''),
    logo_url: logo,
    is_active: raw.is_active !== false && raw.isActive !== false,
    supported_services: raw.supported_services ?? raw.supportedServices ?? null,
    credentials_schema: credSchema,
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

function normalizeSellerShippingPartnerRow(
  raw: unknown,
): SellerShippingPartnerApi | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const id = Number(row.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  const nested =
    asRecord(row.shipping_partner) ?? asRecord(row.shippingPartner);
  if (!nested) {
    return null;
  }
  const shipping_partner = normalizeSellerShippingPartnerNested(nested);
  if (!shipping_partner) {
    return null;
  }
  const sellerId = Number(row.seller_id ?? row.sellerId ?? 0);
  const shipPid = Number(row.shipping_partner_id ?? row.shippingPartnerId ?? 0);
  return {
    id,
    seller_id: Number.isFinite(sellerId) ? sellerId : 0,
    shipping_partner_id: Number.isFinite(shipPid) ? shipPid : 0,
    default_service: strOrNull(row.default_service ?? row.defaultService),
    is_active: row.is_active !== false && row.isActive !== false,
    credentials: normalizeCredentials(row.credentials),
    shipping_partner,
    created_at: String(row.created_at ?? row.createdAt ?? ''),
    updated_at: String(row.updated_at ?? row.updatedAt ?? ''),
  };
}

/**
 * Danh sách đối tác vận chuyển gắn với kho — GET /warehouses/{code}/shipping-partners
 * @param warehouseCode Mã kho (vd. `MCT`), không encode sẵn
 */
export async function fetchWarehouseShippingPartners(
  warehouseCode: string,
  opts?: { signal?: AbortSignal },
): Promise<WarehouseShippingPartnerApi[]> {
  const code = encodeURIComponent(warehouseCode.trim());
  const response = await api.get<WarehouseShippingPartnersApiResponse>(
    `/warehouses/${code}/shipping-partners`,
    { signal: opts?.signal },
  );
  const body = response.data;
  if (!body.success || !Array.isArray(body.data)) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được đối tác vận chuyển',
    );
  }
  return body.data.filter(row => row.is_active !== false);
}

/**
 * Đối tác vận chuyển theo seller —
 * GET /shipping-partner-sellers?per_page=100&include=shippingPartner&filter[is_active]=1
 * (phạm vi theo token đăng nhập).
 */
export async function fetchSellerShippingPartners(opts?: {
  signal?: AbortSignal;
}): Promise<SellerShippingPartnerApi[]> {
  const response = await api.get<SellerShippingPartnersApiResponse>(
    '/shipping-partner-sellers',
    {
      signal: opts?.signal,
      params: {
        per_page: 100,
        include: 'shippingPartner',
        'filter[is_active]': 1,
      },
    },
  );
  const body = response.data;
  if (!body.success || !Array.isArray(body.data)) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được đối tác vận chuyển (seller)',
    );
  }
  const mapped = body.data
    .map(normalizeSellerShippingPartnerRow)
    .filter((row): row is SellerShippingPartnerApi => row != null);
  return mapped.filter(row => row.is_active !== false);
}

export type SellerShippingPartnerDirectoryQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  /** Bỏ qua = không lọc `is_active`. */
  isActive?: boolean;
  /** Lọc theo seller (admin / chi tiết shop). */
  sellerId?: number;
  signal?: AbortSignal;
};

export type SellerShippingPartnerDirectoryResult = {
  items: SellerShippingPartnerApi[];
  meta: SellerShippingPartnersListMeta;
};

/**
 * Danh sách kết nối seller ↔ đối tác VC (Cài đặt — có phân trang).
 * GET `/shipping-partner-sellers?include=shippingPartner&page=&per_page=`
 */
export async function getSellerShippingPartnerDirectory(
  q: SellerShippingPartnerDirectoryQuery,
): Promise<SellerShippingPartnerDirectoryResult> {
  const params: Record<string, string | number | boolean> = {
    page: q.page ?? 1,
    per_page: q.per_page ?? 10,
    include: 'shippingPartner',
  };
  const s = q.search?.trim();
  if (s) {
    params.search = s;
  }
  if (q.isActive === true) {
    params['filter[is_active]'] = 1;
  } else if (q.isActive === false) {
    params['filter[is_active]'] = 0;
  }
  if (q.sellerId != null && Number.isFinite(q.sellerId) && q.sellerId > 0) {
    params['filter[seller_id]'] = q.sellerId;
  }
  const response = await api.get<SellerShippingPartnersApiResponse>(
    '/shipping-partner-sellers',
    {
      params,
      signal: q.signal,
    },
  );
  const body = response.data;
  if (!body.success || !Array.isArray(body.data)) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được danh sách đối tác vận chuyển',
    );
  }
  const mapped = body.data
    .map(normalizeSellerShippingPartnerRow)
    .filter((row): row is SellerShippingPartnerApi => row != null);
  const meta: SellerShippingPartnersListMeta = body.meta ?? {
    current_page: q.page ?? 1,
    from: mapped.length > 0 ? 1 : null,
    last_page: 1,
    per_page: q.per_page ?? 10,
    to: mapped.length > 0 ? mapped.length : null,
    total: mapped.length,
  };
  return { items: mapped, meta };
}

export type ShippingPartnerCatalogDirectoryQuery = {
  page?: number;
  per_page?: number;
  /** Mặc định `-created_at` (khớp web / admin). */
  sort?: string;
  search?: string;
  isActive?: boolean;
  signal?: AbortSignal;
};

export type ShippingPartnerCatalogDirectoryResult = {
  items: ShippingPartnerCatalogApi[];
  meta: SellerShippingPartnersListMeta;
};

/**
 * Danh mục đối tác vận chuyển (nền tảng) — GET `/shipping-partners`.
 * Dùng cho quản trị; seller dùng `getSellerShippingPartnerDirectory`.
 */
export async function getShippingPartnersDirectory(
  q: ShippingPartnerCatalogDirectoryQuery,
): Promise<ShippingPartnerCatalogDirectoryResult> {
  const params: Record<string, string | number | boolean> = {
    page: q.page ?? 1,
    per_page: q.per_page ?? 10,
    sort: q.sort ?? '-created_at',
  };
  const s = q.search?.trim();
  if (s) {
    params.search = s;
  }
  if (q.isActive === true) {
    params['filter[is_active]'] = 1;
  } else if (q.isActive === false) {
    params['filter[is_active]'] = 0;
  }
  const response = await api.get<ShippingPartnersCatalogApiResponse>(
    '/shipping-partners',
    {
      params,
      signal: q.signal,
    },
  );
  const body = response.data;
  if (!body.success || !Array.isArray(body.data)) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được danh mục đối tác vận chuyển',
    );
  }
  const meta: SellerShippingPartnersListMeta = body.meta ?? {
    current_page: q.page ?? 1,
    from: body.data.length > 0 ? 1 : null,
    last_page: 1,
    per_page: q.per_page ?? 10,
    to: body.data.length > 0 ? body.data.length : null,
    total: body.data.length,
  };
  return { items: body.data, meta };
}

export type GetShippingPartnerConfigsParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  search?: string;
  isActive?: boolean;
  signal?: AbortSignal;
};

export type ShippingPartnerConfigsPageResult = {
  items: ShippingPartnerConfigListItemApi[];
  meta: SellerShippingPartnersListMeta | null;
};

/**
 * GET `/shipping-partner-configs` — danh sách cấu hình đối tác VC (TOSOL admin).
 */
export async function getShippingPartnerConfigsPage(
  p: GetShippingPartnerConfigsParams = {},
): Promise<ShippingPartnerConfigsPageResult> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include = 'shippingPartner,currency',
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
  try {
    const { data } = await api.get<ShippingPartnerConfigsListApiResponse>(
      '/shipping-partner-configs',
      { params, signal },
    );
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được cấu hình đối tác vận chuyển',
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
    throw new Error('Không tải được cấu hình đối tác vận chuyển');
  }
}

function unwrapCreatedShippingPartnerConfig(
  res: CreateShippingPartnerConfigApiResponse,
): ShippingPartnerConfigListItemApi | null {
  const d = res.data;
  if (
    d &&
    typeof d === 'object' &&
    'id' in d &&
    typeof (d as ShippingPartnerConfigListItemApi).id === 'number'
  ) {
    return d as ShippingPartnerConfigListItemApi;
  }
  if (d && typeof d === 'object' && 'data' in d) {
    const inner = (d as { data?: ShippingPartnerConfigListItemApi }).data;
    if (inner && typeof inner.id === 'number') {
      return inner;
    }
  }
  return null;
}

/**
 * POST `/shipping-partner-configs` — tạo cấu hình mới (admin).
 */
export async function createShippingPartnerConfig(
  payload: CreateShippingPartnerConfigPayload,
  opts?: { signal?: AbortSignal },
): Promise<ShippingPartnerConfigListItemApi> {
  const body: Record<string, unknown> = {
    shipping_partner_id: payload.shipping_partner_id,
    description: payload.description.trim(),
    is_active: payload.is_active !== false,
  };
  if (payload.currency_id != null && Number.isFinite(payload.currency_id)) {
    body.currency_id = payload.currency_id;
  } else {
    body.currency_id = null;
  }
  const cred = payload.credentials;
  if (cred && Object.keys(cred).length > 0) {
    body.credentials = cred;
  } else {
    body.credentials = {};
  }
  try {
    const { data } = await api.post<CreateShippingPartnerConfigApiResponse>(
      '/shipping-partner-configs',
      body,
      { signal: opts?.signal },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được cấu hình',
      );
    }
    const created = unwrapCreatedShippingPartnerConfig(data);
    if (!created) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Phản hồi tạo cấu hình không hợp lệ',
      );
    }
    return created;
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
    throw new Error('Không tạo được cấu hình đối tác vận chuyển');
  }
}

function unwrapCreatedShippingPartner(
  res: CreateShippingPartnerApiResponse,
): ShippingPartnerCatalogApi | null {
  const d = res.data;
  if (
    d &&
    typeof d === 'object' &&
    'id' in d &&
    typeof (d as ShippingPartnerCatalogApi).id === 'number'
  ) {
    return d as ShippingPartnerCatalogApi;
  }
  if (d && typeof d === 'object' && 'data' in d) {
    const inner = (d as { data?: ShippingPartnerCatalogApi }).data;
    if (inner && typeof inner.id === 'number') {
      return inner;
    }
  }
  return null;
}

/**
 * POST `/shipping-partners` — tạo đối tác vận chuyển (danh mục nền, quản trị).
 */
export async function createShippingPartner(
  payload: CreateShippingPartnerPayload,
  opts?: { signal?: AbortSignal },
): Promise<ShippingPartnerCatalogApi> {
  const code = payload.code.trim().toLowerCase().replace(/\s+/g, '-');
  const name = payload.name.trim();
  const body: Record<string, unknown> = {
    code,
    name,
    is_active: payload.is_active !== false,
  };
  const driver = payload.driver?.trim();
  if (driver) {
    body.driver = driver;
  }
  const logo = payload.logo_url?.trim();
  if (logo) {
    body.logo_url = logo;
  }
  try {
    const { data } = await api.post<CreateShippingPartnerApiResponse>(
      '/shipping-partners',
      body,
      {
        signal: opts?.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được đối tác vận chuyển',
      );
    }
    const created = unwrapCreatedShippingPartner(data);
    if (!created) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Phản hồi tạo đối tác không hợp lệ',
      );
    }
    return created;
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
    throw new Error('Không tạo được đối tác vận chuyển');
  }
}

export type CreateSellerShippingPartnerPayload = {
  shipping_partner_id: number;
  default_service: string;
  is_active?: boolean;
  credentials: Record<string, string>;
};

export type UpdateSellerShippingPartnerPayload = {
  default_service?: string | null;
  is_active: boolean;
  /** Chỉ gửi các trường cần cập nhật (vd. bỏ `password` nếu để trống). */
  credentials?: Record<string, string>;
};

type SellerShippingPartnerWriteResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

/**
 * Tạo kết nối seller ↔ đối tác VC — POST `/shipping-partner-sellers`
 */
export async function createSellerShippingPartner(
  payload: CreateSellerShippingPartnerPayload,
  opts?: { signal?: AbortSignal },
): Promise<SellerShippingPartnerApi> {
  const partnerId = payload.shipping_partner_id;
  if (!Number.isFinite(partnerId) || partnerId <= 0) {
    throw new Error('Chọn đối tác vận chuyển');
  }
  const service = payload.default_service.trim();
  if (!service) {
    throw new Error('Chọn dịch vụ mặc định');
  }
  const cred = payload.credentials;
  if (!cred || Object.keys(cred).length === 0) {
    throw new Error('Nhập thông tin xác thực API');
  }
  const body: Record<string, unknown> = {
    shipping_partner_id: partnerId,
    default_service: service,
    is_active: payload.is_active !== false,
    credentials: cred,
  };
  try {
    const response = await api.post<SellerShippingPartnerWriteResponse>(
      '/shipping-partner-sellers',
      body,
      { signal: opts?.signal },
    );
    const resBody = response.data;
    if (!resBody.success || resBody.data == null) {
      throw new Error(
        typeof resBody.message === 'string'
          ? resBody.message
          : 'Không tạo được kết nối',
      );
    }
    const mapped = normalizeSellerShippingPartnerRow(resBody.data);
    if (!mapped) {
      throw new Error('Phản hồi không hợp lệ');
    }
    return mapped;
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
    throw new Error('Không tạo được kết nối đối tác vận chuyển');
  }
}

/**
 * Cập nhật kết nối seller ↔ đối tác VC — PUT `/shipping-partner-sellers/:id`
 * (payload theo backend; điều chỉnh mapping nếu contract khác).
 */
export async function updateSellerShippingPartner(
  id: number,
  payload: UpdateSellerShippingPartnerPayload,
  opts?: { signal?: AbortSignal },
): Promise<SellerShippingPartnerApi> {
  const sid = encodeURIComponent(String(id));
  const response = await api.put<SellerShippingPartnerWriteResponse>(
    `/shipping-partner-sellers/${sid}`,
    payload,
    { signal: opts?.signal },
  );
  const body = response.data;
  if (!body.success || body.data == null) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không cập nhật được kết nối',
    );
  }
  const mapped = normalizeSellerShippingPartnerRow(body.data);
  if (!mapped) {
    throw new Error('Phản hồi không hợp lệ');
  }
  return mapped;
}

/**
 * Xóa kết nối seller ↔ đối tác VC — DELETE `/shipping-partner-sellers/:id`
 */
export async function deleteSellerShippingPartner(
  id: number,
  opts?: { signal?: AbortSignal },
): Promise<void> {
  const sid = encodeURIComponent(String(id));
  try {
    const { data } = await api.delete<unknown>(
      `/shipping-partner-sellers/${sid}`,
      { signal: opts?.signal },
    );
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      (data as { success: boolean }).success === false
    ) {
      const m = (data as { message?: string }).message;
      throw new Error(typeof m === 'string' ? m : 'Không xóa được kết nối');
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
    throw new Error('Không xóa được kết nối đối tác vận chuyển');
  }
}

/**
 * Xóa cấu hình đối tác VC (admin) — DELETE `/shipping-partner-configs/:id`
 */
export async function deleteShippingPartnerConfig(
  id: number,
  opts?: { signal?: AbortSignal },
): Promise<void> {
  const sid = encodeURIComponent(String(id));
  try {
    const { data } = await api.delete<unknown>(
      `/shipping-partner-configs/${sid}`,
      { signal: opts?.signal },
    );
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      (data as { success: boolean }).success === false
    ) {
      const m = (data as { message?: string }).message;
      throw new Error(typeof m === 'string' ? m : 'Không xóa được cấu hình');
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
    throw new Error('Không xóa được cấu hình đối tác vận chuyển');
  }
}

/**
 * Kiểm tra kết nối đối tác VC (seller–shipping-partner) —
 * POST `/shipping-partner-sellers/:id/test`
 */
export async function testSellerShippingPartnerConnection(
  sellerShippingPartnerSellerId: number,
  opts?: { signal?: AbortSignal },
): Promise<SellerShippingPartnerTestInner> {
  const sid = encodeURIComponent(String(sellerShippingPartnerSellerId));
  const response = await api.post<SellerShippingPartnerTestApiResponse>(
    `/shipping-partner-sellers/${sid}/test`,
    {},
    { signal: opts?.signal },
  );
  const body = response.data;
  if (!body.success) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Kiểm tra kết nối thất bại',
    );
  }
  const inner = body.data;
  if (inner == null || typeof inner !== 'object') {
    throw new Error('Phản hồi không hợp lệ');
  }
  if (!inner.success) {
    throw new Error(
      typeof inner.message === 'string'
        ? inner.message
        : 'Kiểm tra kết nối thất bại',
    );
  }
  return inner;
}

export type GetShippingRatesParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  search?: string;
  isActive?: boolean;
  signal?: AbortSignal;
};

export type ShippingRatesPageResult = {
  items: ShippingRateListItemApi[];
  meta: SellerShippingPartnersListMeta | null;
};

/**
 * GET `/shipping-rates` — danh sách bảng giá vận chuyển (admin).
 */
export async function getShippingRatesPage(
  p: GetShippingRatesParams = {},
): Promise<ShippingRatesPageResult> {
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
    const { data } = await api.get<ShippingRatesListApiResponse>(
      '/shipping-rates',
      {
        params,
        signal,
      },
    );
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được bảng giá vận chuyển',
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
    throw new Error('Không tải được bảng giá vận chuyển');
  }
}

/** Ước tính phí giao — POST /shipping-rates/estimate-cost */
export async function estimateShippingCost(
  payload: ShippingRateEstimatePayload,
  opts?: { signal?: AbortSignal },
): Promise<ShippingEstimateData> {
  const response = await api.post<ShippingEstimateApiResponse>(
    '/shipping-rates/estimate-cost',
    payload,
    { signal: opts?.signal },
  );
  const body = response.data;
  if (!body.success || body.data == null) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không ước tính được phí vận chuyển',
    );
  }
  return body.data;
}
