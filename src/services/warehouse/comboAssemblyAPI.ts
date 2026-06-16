import axios from 'axios';
import api from '@shared/services/api';
import type {
  ComboAssemblyApi,
  ComboAssembliesApiResponse,
  ComboAssembliesMeta,
  ComboAssemblyDetailApiResponse,
  CreateComboAssemblyApiResponse,
  CreateComboAssemblyPayload,
} from './comboAssemblyApiTypes';

const DEFAULT_INCLUDE = 'product,warehouse,requester,completer';

/** Query `include` cho chi tiết lệnh đóng gói combo. */
export const COMBO_ASSEMBLY_DETAIL_INCLUDE =
  'product,product.recipeItems,product.recipeItems.component,warehouse,requester,completer,toLocation';

export type GetComboAssembliesParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string | null;
  filterStatus?: string;
  search?: string;
  signal?: AbortSignal;
};

function buildQueryParams(
  p: GetComboAssembliesParams,
): Record<string, string | number | boolean> {
  const {
    page = 1,
    per_page = 10,
    sort = '-created_at',
    include: includeParam,
    filterStatus,
    search,
  } = p;

  const include =
    includeParam === null
      ? null
      : includeParam === undefined
      ? DEFAULT_INCLUDE
      : includeParam;

  const params: Record<string, string | number | boolean> = {
    page,
    per_page,
    sort,
  };

  if (include != null && String(include).trim() !== '') {
    params.include = include;
  }

  if (filterStatus?.trim()) {
    params['filter[status]'] = filterStatus.trim();
  }
  const q = search?.trim();
  if (q) {
    params.search = q;
  }

  return params;
}

function unwrapList(res: ComboAssembliesApiResponse): {
  items: ComboAssemblyApi[];
  meta: ComboAssembliesMeta | null;
} {
  const raw = res.data;
  if (Array.isArray(raw)) {
    return { items: raw, meta: res.meta ?? null };
  }
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) {
    return { items: raw.data, meta: res.meta ?? null };
  }
  return { items: [], meta: res.meta ?? null };
}

export type ComboAssembliesPageResult = {
  items: ComboAssemblyApi[];
  meta: ComboAssembliesMeta | null;
};

/**
 * GET `/combo-assemblies` — danh sách lệnh đóng gói combo (lắp combo).
 */
export async function getComboAssembliesPage(
  params: GetComboAssembliesParams = {},
): Promise<ComboAssembliesPageResult> {
  try {
    const { data } = await api.get<ComboAssembliesApiResponse>(
      '/combo-assemblies',
      {
        params: buildQueryParams(params),
        signal: params.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh đóng gói combo',
      );
    }
    return unwrapList(data);
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
    throw new Error('Không tải được lệnh đóng gói combo');
  }
}

function unwrapCreated(
  res: CreateComboAssemblyApiResponse,
): ComboAssemblyApi | null {
  const d = res.data;
  if (
    d &&
    typeof d === 'object' &&
    'id' in d &&
    typeof (d as ComboAssemblyApi).id === 'number'
  ) {
    return d as ComboAssemblyApi;
  }
  if (d && typeof d === 'object' && 'data' in d) {
    const inner = (d as { data?: ComboAssemblyApi }).data;
    if (inner && typeof inner.id === 'number') {
      return inner;
    }
  }
  return null;
}

/**
 * POST `/combo-assemblies` — tạo yêu cầu đóng gói combo mới.
 */
export async function createComboAssembly(
  payload: CreateComboAssemblyPayload,
  opts?: { signal?: AbortSignal },
): Promise<ComboAssemblyApi> {
  const body: Record<string, unknown> = {
    warehouse_id: payload.warehouse_id,
    product_id: payload.product_id,
    quantity: payload.quantity,
    pick_strategy: payload.pick_strategy,
  };
  const note = payload.request_note?.trim();
  if (note) {
    body.request_note = note;
  }
  if (payload.seller_id != null && Number.isFinite(payload.seller_id)) {
    body.seller_id = payload.seller_id;
  }
  try {
    const { data } = await api.post<CreateComboAssemblyApiResponse>(
      '/combo-assemblies',
      body,
      {
        signal: opts?.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được yêu cầu đóng gói combo',
      );
    }
    const created = unwrapCreated(data);
    if (!created) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Phản hồi tạo yêu cầu không hợp lệ',
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
    throw new Error('Không tạo được yêu cầu đóng gói combo');
  }
}

/**
 * GET `/combo-assemblies/{assemblyNumber}` — vd. `CA-MCT-2600012`.
 */
export async function getComboAssemblyDetail(
  assemblyRef: string,
  opts?: { signal?: AbortSignal },
): Promise<ComboAssemblyApi> {
  const ref = assemblyRef.trim();
  if (!ref) {
    throw new Error('Thiếu mã lệnh đóng gói combo');
  }
  try {
    const { data } = await api.get<ComboAssemblyDetailApiResponse>(
      `/combo-assemblies/${encodeURIComponent(ref)}`,
      {
        params: { include: COMBO_ASSEMBLY_DETAIL_INCLUDE },
        signal: opts?.signal,
      },
    );
    if (!data.success || !data.data || typeof data.data.id !== 'number') {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được lệnh đóng gói combo',
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
    throw new Error('Không tải được lệnh đóng gói combo');
  }
}
