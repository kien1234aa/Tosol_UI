import axios from 'axios';
import api from '@shared/services/api';
import type {
  CreateSellerWebhookPayload,
  SellerWebhookApi,
  SellerWebhooksApiResponse,
  SellerWebhooksListMeta,
  SellerWebhookWriteResponse,
  UpdateSellerWebhookPayload,
} from './webhookApiTypes';

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

function eventsArray(raw: unknown): string[] | null {
  if (raw == null) {
    return null;
  }
  if (Array.isArray(raw)) {
    const parts = raw.flatMap(x => { const t = String(x).trim(); return t ? [t] : []; });
    return parts.length > 0 ? parts : null;
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const inner = o.data ?? o.events;
    if (Array.isArray(inner)) {
      return eventsArray(inner);
    }
  }
  if (typeof raw === 'string') {
    const parts = raw
      .split(/[,;\n]+/)
      .flatMap(s => { const t = s.trim(); return t ? [t] : []; });
    return parts.length > 0 ? parts : null;
  }
  return null;
}

function eventsDisplay(raw: unknown): string | null {
  if (raw == null) {
    return null;
  }
  if (Array.isArray(raw)) {
    const parts = raw.flatMap(x => { const t = String(x).trim(); return t ? [t] : []; });
    return parts.length > 0 ? parts.join(', ') : null;
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const inner = o.data ?? o.events;
    if (Array.isArray(inner)) {
      return eventsDisplay(inner);
    }
  }
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }
  return null;
}

export function normalizeSellerWebhookRow(
  raw: unknown,
): SellerWebhookApi | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const id = Number(row.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  const urlRaw =
    strOrNull(row.url) ??
    strOrNull(row.endpoint_url) ??
    strOrNull(row.target_url) ??
    strOrNull(row.webhook_url);
  const url = (urlRaw ?? '').trim() || '—';
  const desc = strOrNull(row.description) ?? strOrNull(row.name);
  const eventsParsed =
    eventsArray(row.events) ??
    eventsArray(row.topics) ??
    eventsArray(row.event_types) ??
    eventsArray(row.subscribed_events);
  const eventsLabel =
    eventsDisplay(row.events) ??
    eventsDisplay(row.topics) ??
    eventsDisplay(row.event_types) ??
    eventsDisplay(row.subscribed_events) ??
    (eventsParsed != null ? eventsParsed.join(', ') : null);
  const sellerId = Number(row.seller_id ?? row.sellerId ?? 0);
  return {
    id,
    seller_id: Number.isFinite(sellerId) && sellerId > 0 ? sellerId : undefined,
    url,
    description: desc,
    events_label: eventsLabel,
    events: eventsParsed,
    is_active: row.is_active !== false && row.isActive !== false,
    created_at: String(row.created_at ?? row.createdAt ?? ''),
    updated_at: String(row.updated_at ?? row.updatedAt ?? ''),
  };
}

export type SellerWebhookDirectoryQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  isActive?: boolean;
};

export type SellerWebhookDirectoryResult = {
  items: SellerWebhookApi[];
  meta: SellerWebhooksListMeta;
};

/**
 * Danh sách webhook của seller — GET `/seller-webhooks?page=&per_page=&sort=-created_at`
 */
export async function getSellerWebhookDirectory(
  q: SellerWebhookDirectoryQuery,
): Promise<SellerWebhookDirectoryResult> {
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
  const response = await api.get<SellerWebhooksApiResponse>(
    '/seller-webhooks',
    { params },
  );
  const body = response.data;
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
  if (!body.success || rawRows == null) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được danh sách webhook',
    );
  }
  const mapped = rawRows
    .map(normalizeSellerWebhookRow)
    .filter((row): row is SellerWebhookApi => row != null);
  const meta: SellerWebhooksListMeta = body.meta ?? {
    current_page: q.page ?? 1,
    from: mapped.length > 0 ? 1 : null,
    last_page: 1,
    per_page: q.per_page ?? 10,
    to: mapped.length > 0 ? mapped.length : null,
    total: mapped.length,
  };
  return { items: mapped, meta };
}

function extractAxiosMessage(e: unknown, fallback: string): never {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data as { message?: string } | undefined;
    if (typeof d?.message === 'string') {
      throw new Error(d.message);
    }
  }
  if (e instanceof Error) {
    throw e;
  }
  throw new Error(fallback);
}

/**
 * Tạo webhook — POST `/seller-webhooks`
 */
export async function createSellerWebhook(
  payload: CreateSellerWebhookPayload,
  opts?: { signal?: AbortSignal },
): Promise<SellerWebhookApi> {
  const url = payload.url.trim();
  if (!url) {
    throw new Error('Vui lòng nhập URL webhook');
  }
  const body: Record<string, unknown> = {
    url,
    is_active: payload.is_active !== false,
  };
  const desc = payload.description?.trim();
  if (desc) {
    body.description = desc;
  }
  if (payload.events != null && payload.events.length > 0) {
    body.events = payload.events;
  }
  try {
    const { data } = await api.post<SellerWebhookWriteResponse>(
      '/seller-webhooks',
      body,
      { signal: opts?.signal },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tạo được webhook',
      );
    }
    const mapped = normalizeSellerWebhookRow(data.data);
    if (!mapped) {
      throw new Error('Phản hồi không hợp lệ');
    }
    return mapped;
  } catch (e: unknown) {
    extractAxiosMessage(e, 'Không tạo được webhook');
  }
}

/**
 * Cập nhật webhook — PUT `/seller-webhooks/:id`
 */
export async function updateSellerWebhook(
  id: number,
  payload: UpdateSellerWebhookPayload,
  opts?: { signal?: AbortSignal },
): Promise<SellerWebhookApi> {
  const sid = encodeURIComponent(String(id));
  const body: Record<string, unknown> = {};
  if (payload.url != null) {
    const url = payload.url.trim();
    if (!url) {
      throw new Error('URL webhook không hợp lệ');
    }
    body.url = url;
  }
  if (payload.description !== undefined) {
    const desc = payload.description?.trim();
    body.description = desc && desc.length > 0 ? desc : null;
  }
  if (payload.is_active !== undefined) {
    body.is_active = payload.is_active;
  }
  if (payload.events !== undefined) {
    body.events = payload.events;
  }
  try {
    const { data } = await api.put<SellerWebhookWriteResponse>(
      `/seller-webhooks/${sid}`,
      body,
      { signal: opts?.signal },
    );
    if (!data.success || data.data == null) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không cập nhật được webhook',
      );
    }
    const mapped = normalizeSellerWebhookRow(data.data);
    if (!mapped) {
      throw new Error('Phản hồi không hợp lệ');
    }
    return mapped;
  } catch (e: unknown) {
    extractAxiosMessage(e, 'Không cập nhật được webhook');
  }
}

/**
 * Xóa webhook của seller — DELETE `/seller-webhooks/:id`
 */
export async function deleteSellerWebhook(
  id: number,
  opts?: { signal?: AbortSignal },
): Promise<void> {
  const sid = encodeURIComponent(String(id));
  try {
    const { data } = await api.delete<unknown>(`/seller-webhooks/${sid}`, {
      signal: opts?.signal,
    });
    if (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      (data as { success: boolean }).success === false
    ) {
      const m = (data as { message?: string }).message;
      throw new Error(typeof m === 'string' ? m : 'Không xóa được webhook');
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
    throw new Error('Không xóa được webhook');
  }
}
