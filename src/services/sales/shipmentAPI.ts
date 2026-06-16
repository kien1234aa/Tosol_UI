import axios from 'axios';
import api from '@shared/services/api';
import type {
  ShipmentRecord,
  ShipmentsListApiResponse,
  ShipmentsListMeta,
} from './shipmentApiTypes';

/** Khớp web TOSOL — lồng đơn bán + đối tác VC. */
export const SHIPMENTS_LIST_INCLUDE =
  'saleOrder.currency,shippingPartnerSeller.shippingPartner,shippingPartnerWarehouse.shippingPartnerConfig.shippingPartner';

/**
 * Giá trị `filter[status]` cho ô "Đang vận chuyển" — khớp API (`in_transit`).
 */
export const SHIPMENT_FILTER_IN_TRANSIT = 'in_transit';

/** Tuỳ chọn `filter[status]` — nhãn UI / slug API (khớp backend v2). */
export const SHIPMENT_STATUS_FILTER_OPTIONS: {
  label: string;
  value: string;
}[] = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã tạo đơn', value: 'created' },
  { label: 'Đang lấy hàng / sẵn sàng lấy', value: 'picking' },
  { label: 'Đang vận chuyển', value: 'in_transit' },
  { label: 'Đang giao hàng', value: 'out_for_delivery' },
  { label: 'Đang giao', value: 'shipping' },
  { label: 'Giao thất bại', value: 'failed_delivery' },
  { label: 'Đang hoàn', value: 'returning' },
  { label: 'Đã hoàn', value: 'returned' },
  { label: 'Đã hủy', value: 'cancelled' },
  { label: 'Thất lạc', value: 'lost' },
  { label: 'Hư hỏng', value: 'damaged' },
];

/**
 * Bộ lọc GET /shipments — chỉ map sang các key backend cho phép:
 * `id, seller_id, warehouse_id, sale_order_id, shipping_partner_code, status,
 *  tracking_number, search, saleOrder.customer_id`
 */
export type ShipmentListFilters = {
  /** → `filter[status]` */
  filterStatus?: string;
  /** → `filter[shipping_partner_code]` (vd. `ghn`, `best-express`) */
  filterShippingPartnerCode?: string;
  /** → `filter[search]` — mã vận đơn, SĐT, … */
  filterSearch?: string;
};

export type ShipmentPartnerFilterOption = {
  /** Luôn `code:ghn` — khớp query `filter[shipping_partner_code]`. */
  key: string;
  label: string;
  partnerCode: string;
};

export type GetShipmentsParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  filters?: ShipmentListFilters;
  signal?: AbortSignal;
};

/** Chỉ thêm query filter khi có giá trị — tránh gửi key không được API chấp nhận. */
export function applyShipmentListFiltersToParams(
  params: Record<string, string | number>,
  filters: ShipmentListFilters | undefined,
): void {
  if (!filters) {
    return;
  }
  const st = filters.filterStatus?.trim();
  if (st) {
    params['filter[status]'] = st;
  }
  const spc = filters.filterShippingPartnerCode?.trim();
  if (spc) {
    params['filter[shipping_partner_code]'] = spc;
  }
  const q = filters.filterSearch?.trim();
  if (q) {
    params['filter[search]'] = q;
  }
}

function buildShipmentQueryParams(
  p: Omit<GetShipmentsParams, 'signal'>,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 15,
    sort = '-created_at',
    include = SHIPMENTS_LIST_INCLUDE,
    filters,
  } = p;

  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
    include,
  };

  applyShipmentListFiltersToParams(params, filters);

  return params;
}

/** Gợi ý đối tác lọc từ mẫu vận đơn (GET /shipments, không filter). */
function labelFromPartnerCode(code: string): string {
  return code
    .split(/[-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function extractShipmentPartnerFilterOptions(
  items: ShipmentRecord[],
): ShipmentPartnerFilterOption[] {
  const seen = new Set<string>();
  const out: ShipmentPartnerFilterOption[] = [];

  const pushByCode = (code: string, displayName?: string | null) => {
    const c = code.trim().toLowerCase();
    if (!c) {
      return;
    }
    const key = `code:${c}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    const label =
      (displayName?.trim() || labelFromPartnerCode(c)).trim() ||
      labelFromPartnerCode(c);
    out.push({ key, label, partnerCode: c });
  };

  for (const s of items) {
    const sp =
      s.shipping_partner_seller?.shipping_partner ??
      s.shippingPartnerSeller?.shippingPartner;
    const codeFromNested = sp?.code?.trim();
    if (codeFromNested) {
      pushByCode(codeFromNested, sp?.name);
      continue;
    }
    const wSnake = s.shipping_partner_warehouse;
    const wCamel = s.shippingPartnerWarehouse;
    const sp2 =
      wSnake?.shipping_partner_config?.shipping_partner ??
      wCamel?.shippingPartnerConfig?.shippingPartner;
    const codeFromWh = sp2?.code?.trim();
    if (codeFromWh) {
      pushByCode(codeFromWh, sp2?.name);
      continue;
    }
    const raw = s.shipping_partner_code ?? s.shippingPartnerCode;
    if (typeof raw === 'string' && raw.trim()) {
      pushByCode(raw, null);
    }
  }

  return out.sort((a, b) => a.label.localeCompare(b.label, 'vi'));
}

export async function fetchShipmentPartnerFilterOptions(
  signal?: AbortSignal,
): Promise<ShipmentPartnerFilterOption[]> {
  const res = await getShipments({
    page: 1,
    per_page: 200,
    sort: '-created_at',
    filters: undefined,
    signal,
  });
  if (!res.success || !Array.isArray(res.data)) {
    return [];
  }
  return extractShipmentPartnerFilterOptions(res.data);
}

export async function getShipments(
  params: GetShipmentsParams = {},
): Promise<ShipmentsListApiResponse> {
  const path = '/shipments';
  const { signal, ...rest } = params;
  try {
    const { data } = await api.get<ShipmentsListApiResponse>(path, {
      params: buildShipmentQueryParams(rest),
      signal,
    });
    return data;
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
    throw new Error('Không tải được vận đơn');
  }
}

export type FetchShipmentsByCustomerParams = {
  customerId: number;
  perPage?: number;
  signal?: AbortSignal;
};

export type FetchShipmentsByCustomerResult = {
  items: ShipmentRecord[];
  meta: ShipmentsListMeta;
};

/**
 * Danh sách vận đơn theo khách (lọc theo đơn của customer).
 * @see GET /shipments?filter[saleOrder.customer_id]=…
 */
export async function fetchShipmentsByCustomerId({
  customerId,
  perPage = 20,
  signal,
}: FetchShipmentsByCustomerParams): Promise<FetchShipmentsByCustomerResult> {
  const response = await api.get<ShipmentsListApiResponse>('/shipments', {
    params: {
      per_page: perPage,
      sort: '-created_at',
      include: SHIPMENTS_LIST_INCLUDE,
      'filter[saleOrder.customer_id]': customerId,
    },
    signal,
  });
  const body = response.data;
  if (body.meta === undefined) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được vận đơn',
    );
  }
  return {
    items: Array.isArray(body.data) ? (body.data as ShipmentRecord[]) : [],
    meta: body.meta,
  };
}
