import type { PackingOrderApi } from '@services/warehouse/packingOrderApiTypes';
import type {
  PackingOrderListRow,
  PackingOrderRowStatus,
} from '@features/pack/packingTypes';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chá» \u0111Ă³ng gĂ³i',
  packing: 'Äang \u0111Ă³ng gĂ³i',
  cancelled: 'ÄĂ£ há»§y',
  completed: 'HoĂ n táº¥t',
};

function normalizeStatus(
  raw: string | null | undefined,
): PackingOrderRowStatus {
  const s = (raw ?? '').toLowerCase().trim();
  if (
    s === 'pending' ||
    s === 'packing' ||
    s === 'cancelled' ||
    s === 'completed'
  ) {
    return s;
  }
  return 'other';
}

/** NhĂ£n tráº¡ng thĂ¡i lá»‡nh \u0111Ă³ng gĂ³i (danh sĂ¡ch + chi tiáº¿t). */
export function packingOrderStatusLabel(
  raw: string | null | undefined,
): string {
  const s = (raw ?? '').toLowerCase().trim();
  return STATUS_LABELS[s] ?? (raw?.trim() ? raw.trim() : 'KhĂ¡c');
}

function num(v: number | string | null | undefined, fallback = 0): number {
  if (v == null) {
    return fallback;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function formatDateVi(iso: string | null | undefined): string {
  if (!iso?.trim()) {
    return 'â€”';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso.slice(0, 10);
  }
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function packingOrderToListRow(
  po: PackingOrderApi,
): PackingOrderListRow {
  const rowStatus = normalizeStatus(po.status);
  const items = po.sale_order?.items ?? [];
  const first = items[0];
  const prod = first?.product;
  const thumb = prod?.thumbnail_url?.trim() || prod?.image_url?.trim() || null;
  const productName =
    prod?.name?.trim() || first?.name?.trim() || first?.sku?.trim() || 'â€”';
  const second = items[1];
  const secondProd = second?.product;
  const productSecondLabel =
    items.length >= 2
      ? secondProd?.name?.trim() ||
        second?.name?.trim() ||
        second?.sku?.trim() ||
        null
      : null;
  const moreProductsCount = items.length > 2 ? items.length - 2 : 0;

  const summary = po.summary;
  const packed = num(summary?.packed_boxes);
  const total = num(summary?.total_boxes, num(po.box_count, 0));

  return {
    id: po.id,
    uuid: po.uuid?.trim() ?? null,
    orderNumber: po.order_number?.trim() || `#${po.id}`,
    rowStatus,
    statusLabel: packingOrderStatusLabel(po.status),
    warehouseName: po.warehouse?.name?.trim() || 'â€”',
    sellerName: po.seller?.name?.trim() || 'â€”',
    saleOrderNumber: po.sale_order?.order_number?.trim() || 'â€”',
    productLabel: productName,
    productSecondLabel,
    moreProductsCount,
    productThumb: thumb,
    pickProgressPct: clampPct(num(po.pick_progress)),
    packingProgressPct: clampPct(num(po.packing_progress)),
    boxesPackedLabel:
      total > 0 ? `${packed}/${total} thĂ¹ng` : `${num(po.box_count)} thĂ¹ng`,
    hasPendingUnpack: Boolean(po.has_pending_unpack),
    noteSnippet: (po.note ?? '').trim().slice(0, 120),
    createdAtLabel: formatDateVi(po.created_at),
  };
}