import axios from 'axios';
import api from '@shared/services/api';
import type {
  PaymentGatewayNestedApi,
  PaymentGatewaysApiResponse,
  PaymentGatewayListMeta,
  SellerPaymentGatewayApi,
} from './paymentGatewayApiTypes';

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

function normalizePaymentGatewayNested(
  raw: Record<string, unknown>,
): PaymentGatewayNestedApi | null {
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
    credentials_schema: credSchema,
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
}

function normalizeSellerPaymentGatewayRow(
  raw: unknown,
): SellerPaymentGatewayApi | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const id = Number(row.id);
  if (!Number.isFinite(id)) {
    return null;
  }

  const nested =
    asRecord(row.payment_gateway) ??
    asRecord(row.paymentGateway) ??
    row;

  const payment_gateway = normalizePaymentGatewayNested(nested);
  if (!payment_gateway) {
    return null;
  }

  const sellerId = Number(row.seller_id ?? row.sellerId ?? 0);
  const gatewayId = Number(
    row.payment_gateway_id ?? row.paymentGatewayId ?? payment_gateway.id,
  );
  const isReady =
    row.is_ready === true ||
    row.isReady === true ||
    row.is_ready === 1 ||
    row.isReady === 1;

  return {
    id,
    seller_id: Number.isFinite(sellerId) ? sellerId : 0,
    payment_gateway_id: Number.isFinite(gatewayId) ? gatewayId : payment_gateway.id,
    is_active: row.is_active !== false && row.isActive !== false,
    is_ready: isReady,
    credentials: normalizeCredentials(row.credentials),
    payment_gateway,
    created_at: String(row.created_at ?? row.createdAt ?? ''),
    updated_at: String(row.updated_at ?? row.updatedAt ?? ''),
  };
}

export type PaymentGatewayDirectoryQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  /** Bỏ qua = không lọc `is_active`. */
  isActive?: boolean;
  /** Chỉ cổng đã sẵn sàng — `filter[is_ready]=true`. */
  isReady?: boolean;
  /** Lọc theo seller (admin / chi tiết shop). */
  sellerId?: number;
  signal?: AbortSignal;
};

export type PaymentGatewayDirectoryResult = {
  items: SellerPaymentGatewayApi[];
  meta: PaymentGatewayListMeta;
};

/**
 * Danh sách cổng thanh toán seller —
 * GET `/payment-gateways?include=paymentGateway&filter[is_ready]=true`
 */
export async function getPaymentGatewayDirectory(
  q: PaymentGatewayDirectoryQuery,
): Promise<PaymentGatewayDirectoryResult> {
  const params: Record<string, string | number | boolean> = {
    page: q.page ?? 1,
    per_page: q.per_page ?? 10,
    include: 'paymentGateway',
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
  if (q.isReady === true) {
    params['filter[is_ready]'] = true;
  } else if (q.isReady === false) {
    params['filter[is_ready]'] = false;
  }
  if (q.sellerId != null && Number.isFinite(q.sellerId) && q.sellerId > 0) {
    params['filter[seller_id]'] = q.sellerId;
  }

  try {
    const response = await api.get<PaymentGatewaysApiResponse>(
      '/payment-gateways',
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
          : 'Không tải được cổng thanh toán',
      );
    }
    const items = body.data
      .map(normalizeSellerPaymentGatewayRow)
      .filter((row): row is SellerPaymentGatewayApi => row != null);
    const meta = body.meta ?? {
      current_page: q.page ?? 1,
      from: items.length > 0 ? 1 : null,
      last_page: 1,
      per_page: q.per_page ?? 10,
      to: items.length > 0 ? items.length : null,
      total: items.length,
    };
    return { items, meta };
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
    throw new Error('Không tải được cổng thanh toán');
  }
}
