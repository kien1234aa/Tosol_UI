import { isAxiosError } from 'axios';
import api from '@shared/services/api';
import type {
  StaffUserApi,
  StaffUserDetailApi,
  StaffUsersApiResponse,
  StaffUsersListMeta,
} from './staffApiTypes';

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

export function normalizeStaffUserRow(raw: unknown): StaffUserApi | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const id = Number(row.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  return {
    id,
    uuid: String(row.uuid ?? ''),
    seller_id: Number(row.seller_id ?? row.sellerId ?? 0) || 0,
    name: String(row.name ?? '').trim() || '—',
    email: String(row.email ?? '').trim() || '—',
    phone: strOrNull(row.phone),
    role:
      String(row.role ?? 'staff')
        .trim()
        .toLowerCase() || 'staff',
    is_active: row.is_active !== false && row.isActive !== false,
    is_tosol_user: row.is_tosol_user === true || row.isTosolUser === true,
    is_seller_user: row.is_seller_user !== false && row.isSellerUser !== false,
    email_verified_at: strOrNull(row.email_verified_at ?? row.emailVerifiedAt),
    last_login_at: strOrNull(row.last_login_at ?? row.lastLoginAt),
    created_at: String(row.created_at ?? row.createdAt ?? ''),
    updated_at: String(row.updated_at ?? row.updatedAt ?? ''),
  };
}

function parseListPayload(body: StaffUsersApiResponse): {
  rows: unknown[];
  meta: StaffUsersListMeta | null;
} {
  let rawRows: unknown[] | null = null;
  if (Array.isArray(body.data)) {
    rawRows = body.data;
  } else if (
    body.data != null &&
    typeof body.data === 'object' &&
    'data' in body.data
  ) {
    const inner = (body.data as { data?: unknown }).data;
    if (Array.isArray(inner)) {
      rawRows = inner;
    }
  }
  return { rows: rawRows ?? [], meta: body.meta ?? null };
}

function metaOrSynthetic(
  rows: StaffUserApi[],
  q: { page?: number; per_page?: number },
  meta: StaffUsersListMeta | null,
): StaffUsersListMeta {
  if (meta) {
    return meta;
  }
  return {
    current_page: q.page ?? 1,
    from: rows.length > 0 ? 1 : null,
    last_page: 1,
    per_page: q.per_page ?? 10,
    to: rows.length > 0 ? rows.length : null,
    total: rows.length,
  };
}

export type StaffUserDirectoryQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  isActive?: boolean;
  role?: 'admin' | 'staff';
};

export type StaffUserDirectoryResult = {
  items: StaffUserApi[];
  meta: StaffUsersListMeta;
};

/**
 * Danh sách người dùng / nhân viên — GET `/users?page=&per_page=&sort=-created_at`
 */
export async function getSellerStaffDirectory(
  q: StaffUserDirectoryQuery,
): Promise<StaffUserDirectoryResult> {
  const params: Record<string, string | number> = {
    page: q.page ?? 1,
    per_page: q.per_page ?? 10,
    sort: '-created_at',
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
  if (q.role === 'admin' || q.role === 'staff') {
    params['filter[role]'] = q.role;
  }
  const response = await api.get<StaffUsersApiResponse>('/users', { params });
  const body = response.data;
  if (!body.success) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được danh sách nhân viên',
    );
  }
  const { rows: rawRows, meta: rawMeta } = parseListPayload(body);
  const mapped = rawRows
    .map(normalizeStaffUserRow)
    .filter((row): row is StaffUserApi => row != null);
  return {
    items: mapped,
    meta: metaOrSynthetic(mapped, q, rawMeta),
  };
}

function totalFromResponse(body: StaffUsersApiResponse): number {
  const m = body.meta?.total;
  if (typeof m === 'number' && Number.isFinite(m)) {
    return m;
  }
  return 0;
}

/**
 * Tổng số người dùng (theo `meta.total` với `per_page=1`) — dùng cho thẻ tóm tắt.
 */
export async function getStaffUserTotals(): Promise<{
  all: number;
  active: number;
  inactive: number;
}> {
  const [allRes, activeRes, inactiveRes] = await Promise.all([
    api.get<StaffUsersApiResponse>('/users', {
      params: { per_page: 1, page: 1 },
    }),
    api.get<StaffUsersApiResponse>('/users', {
      params: { per_page: 1, page: 1, 'filter[is_active]': 1 },
    }),
    api.get<StaffUsersApiResponse>('/users', {
      params: { per_page: 1, page: 1, 'filter[is_active]': 0 },
    }),
  ]);
  const a = allRes.data;
  const ac = activeRes.data;
  const ina = inactiveRes.data;
  if (!a.success || !ac.success || !ina.success) {
    throw new Error(
      typeof a.message === 'string'
        ? a.message
        : 'Không tải được thống kê nhân viên',
    );
  }
  return {
    all: totalFromResponse(a),
    active: totalFromResponse(ac),
    inactive: totalFromResponse(ina),
  };
}

export function normalizeStaffUserDetailRow(
  raw: unknown,
): StaffUserDetailApi | null {
  const base = normalizeStaffUserRow(raw);
  if (!base) {
    return null;
  }
  const row = asRecord(raw);
  if (!row) {
    return { ...base, seller: null, warehouses: [] };
  }
  const s = asRecord(row.seller);
  const seller =
    s && Number.isFinite(Number(s.id))
      ? {
          id: Number(s.id),
          name: String(s.name ?? '').trim() || '—',
        }
      : null;
  const wh = row.warehouses;
  const warehouses = Array.isArray(wh) ? wh : [];
  return { ...base, seller, warehouses };
}

type StaffUserSingleResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

/**
 * Chi tiết người dùng / nhân viên — GET `/users/:id`
 */
export async function getStaffUserById(
  id: number,
  opts?: { signal?: AbortSignal },
): Promise<StaffUserDetailApi> {
  const sid = encodeURIComponent(String(id));
  const response = await api.get<StaffUserSingleResponse>(`/users/${sid}`, {
    signal: opts?.signal,
  });
  const body = response.data;
  if (!body.success || body.data == null) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được nhân viên',
    );
  }
  let raw = body.data;
  if (
    raw != null &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    'data' in raw
  ) {
    const inner = (raw as { data?: unknown }).data;
    if (inner != null) {
      raw = inner;
    }
  }
  const mapped = normalizeStaffUserDetailRow(raw);
  if (!mapped) {
    throw new Error('Phản hồi không hợp lệ');
  }
  return mapped;
}

export type CreateStaffUserPayload = {
  name: string;
  email: string;
  password: string;
  /** Chuỗi rỗng nếu không nhập — backend có thể chấp nhận `""`. */
  phone: string;
  role: 'admin' | 'staff';
  seller_id: number;
  is_active: boolean;
};

type StaffUserWriteResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

/**
 * Tạo người dùng / nhân viên — POST `/users`
 * Body mẫu: `{ name, email, password, phone, role, seller_id, is_active }`.
 */
export async function createStaffUser(
  payload: CreateStaffUserPayload,
  opts?: { signal?: AbortSignal },
): Promise<StaffUserApi> {
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: payload.password,
    phone: payload.phone.trim(),
    role: payload.role,
    seller_id: payload.seller_id,
    is_active: payload.is_active,
  };
  const response = await api.post<StaffUserWriteResponse>('/users', body, {
    signal: opts?.signal,
  });
  const res = response.data;
  if (!res.success || res.data == null) {
    throw new Error(
      typeof res.message === 'string'
        ? res.message
        : 'Không tạo được nhân viên',
    );
  }
  const mapped = normalizeStaffUserRow(res.data);
  if (!mapped) {
    throw new Error('Phản hồi không hợp lệ');
  }
  return mapped;
}

function staffWriteErrorMessage(e: unknown, fallback: string): Error {
  if (isAxiosError(e)) {
    const d = e.response?.data as { message?: string } | undefined;
    if (typeof d?.message === 'string' && d.message.trim()) {
      return new Error(d.message);
    }
  }
  if (e instanceof Error) {
    return e;
  }
  return new Error(fallback);
}

/**
 * Vô hiệu hóa người dùng — POST `/users/:uuid/deactivate`
 */
export async function deactivateStaffUser(
  userUuid: string,
  opts?: { signal?: AbortSignal },
): Promise<StaffUserApi> {
  const u = userUuid.trim();
  if (!u) {
    throw new Error('Thiếu mã định danh người dùng (UUID).');
  }
  const sid = encodeURIComponent(u);
  try {
    const response = await api.post<StaffUserWriteResponse>(
      `/users/${sid}/deactivate`,
      {},
      { signal: opts?.signal },
    );
    const res = response.data;
    if (!res.success || res.data == null) {
      throw new Error(
        typeof res.message === 'string'
          ? res.message
          : 'Không vô hiệu hóa được người dùng',
      );
    }
    const mapped = normalizeStaffUserRow(res.data);
    if (!mapped) {
      throw new Error('Phản hồi không hợp lệ');
    }
    return mapped;
  } catch (e: unknown) {
    throw staffWriteErrorMessage(e, 'Không vô hiệu hóa được người dùng');
  }
}

/**
 * Kích hoạt lại người dùng — POST `/users/:uuid/activate`
 */
export async function activateStaffUser(
  userUuid: string,
  opts?: { signal?: AbortSignal },
): Promise<StaffUserApi> {
  const u = userUuid.trim();
  if (!u) {
    throw new Error('Thiếu mã định danh người dùng (UUID).');
  }
  const sid = encodeURIComponent(u);
  try {
    const response = await api.post<StaffUserWriteResponse>(
      `/users/${sid}/activate`,
      {},
      { signal: opts?.signal },
    );
    const res = response.data;
    if (!res.success || res.data == null) {
      throw new Error(
        typeof res.message === 'string'
          ? res.message
          : 'Không kích hoạt lại được người dùng',
      );
    }
    const mapped = normalizeStaffUserRow(res.data);
    if (!mapped) {
      throw new Error('Phản hồi không hợp lệ');
    }
    return mapped;
  } catch (e: unknown) {
    throw staffWriteErrorMessage(e, 'Không kích hoạt lại được người dùng');
  }
}

export type UpdateStaffUserPayload = {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff';
};

/**
 * Cập nhật người dùng / nhân viên — PATCH `/users/:uuid`
 * Body: `{ name, email, phone, role }` — phản hồi có thể kèm `seller`, `warehouses`.
 */
export async function updateStaffUser(
  userUuid: string,
  payload: UpdateStaffUserPayload,
  opts?: { signal?: AbortSignal },
): Promise<StaffUserDetailApi> {
  const u = userUuid.trim();
  if (!u) {
    throw new Error('Thiếu mã định danh người dùng (UUID).');
  }
  const sid = encodeURIComponent(u);
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    role: payload.role,
  };
  try {
    const response = await api.patch<StaffUserWriteResponse>(
      `/users/${sid}`,
      body,
      {
        signal: opts?.signal,
      },
    );
    const res = response.data;
    if (!res.success || res.data == null) {
      throw new Error(
        typeof res.message === 'string'
          ? res.message
          : 'Không cập nhật được người dùng',
      );
    }
    let raw: unknown = res.data;
    if (
      raw != null &&
      typeof raw === 'object' &&
      !Array.isArray(raw) &&
      'data' in raw
    ) {
      const inner = (raw as { data?: unknown }).data;
      if (inner != null) {
        raw = inner;
      }
    }
    const mapped = normalizeStaffUserDetailRow(raw);
    if (!mapped) {
      throw new Error('Phản hồi không hợp lệ');
    }
    return mapped;
  } catch (e: unknown) {
    throw staffWriteErrorMessage(e, 'Không cập nhật được người dùng');
  }
}

export type ChangeStaffUserPasswordPayload = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

type StaffPasswordChangeResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

/**
 * Đổi mật khẩu người dùng — POST `/users/:uuid/change-password`
 * Body: `current_password`, `new_password`, `new_password_confirmation`.
 */
export async function changeStaffUserPassword(
  userUuid: string,
  payload: ChangeStaffUserPasswordPayload,
  opts?: { signal?: AbortSignal },
): Promise<void> {
  const u = userUuid.trim();
  if (!u) {
    throw new Error('Thiếu mã định danh người dùng (UUID).');
  }
  const sid = encodeURIComponent(u);
  const body = {
    current_password: payload.current_password,
    new_password: payload.new_password,
    new_password_confirmation: payload.new_password_confirmation,
  };
  try {
    const response = await api.post<StaffPasswordChangeResponse>(
      `/users/${sid}/change-password`,
      body,
      { signal: opts?.signal },
    );
    const res = response.data;
    if (!res.success) {
      throw new Error(
        typeof res.message === 'string'
          ? res.message
          : 'Không đổi được mật khẩu',
      );
    }
  } catch (e: unknown) {
    throw staffWriteErrorMessage(e, 'Không đổi được mật khẩu');
  }
}

type StaffDeleteResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

/**
 * Xóa người dùng — DELETE `/users/:uuid`
 */
export async function deleteStaffUser(
  userUuid: string,
  opts?: { signal?: AbortSignal },
): Promise<void> {
  const u = userUuid.trim();
  if (!u) {
    throw new Error('Thiếu mã định danh người dùng (UUID).');
  }
  const sid = encodeURIComponent(u);
  try {
    const response = await api.delete<StaffDeleteResponse>(`/users/${sid}`, {
      signal: opts?.signal,
    });
    const res = response.data;
    if (!res.success) {
      throw new Error(
        typeof res.message === 'string'
          ? res.message
          : 'Không xóa được người dùng',
      );
    }
  } catch (e: unknown) {
    throw staffWriteErrorMessage(e, 'Không xóa được người dùng');
  }
}
