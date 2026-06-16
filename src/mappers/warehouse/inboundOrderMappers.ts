import i18n from '@shared/i18n';
import { formatOrderDateLocale } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { InboundOrderApi } from '@services/warehouse/inboundOrderApiTypes';
import type {
  InboundOrderListRow,
  InboundOrderRowStatus,
} from '@features/inbound/inboundOrderTypes';

function normalizeStatus(
  raw: string | null | undefined,
): InboundOrderRowStatus {
  const s = (raw ?? '').toLowerCase().trim();
  if (
    s === 'pending' ||
    s === 'receiving' ||
    s === 'completed' ||
    s === 'cancelled'
  ) {
    return s;
  }
  return 'other';
}

/** NhĂ£n tráº¡ng thĂ¡i phiáº¿u nháº­p kho (danh sĂ¡ch + chi tiáº¿t). */
export function inboundOrderStatusLabel(
  raw: string | null | undefined,
): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (
    s === 'pending' ||
    s === 'receiving' ||
    s === 'completed' ||
    s === 'cancelled'
  ) {
    return i18n.t(`warehouseInbound.status.${s}`);
  }
  return raw?.trim() ? raw.trim() : i18n.t('warehouseInbound.statusOther');
}

/** NhĂ£n loáº¡i nháº­p kho. */
export function inboundOrderTypeLabel(o: InboundOrderApi): string {
  const t = (o.type ?? '').toLowerCase().trim();
  if (
    t === 'purchase' ||
    t === 'return' ||
    t === 'transfer' ||
    t === 'adjustment'
  ) {
    return i18n.t(`warehouseInbound.type.${t}`);
  }
  return o.type?.trim()
    ? o.type.trim()
    : i18n.t('warehouseInbound.typeFallback');
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

function linkedOrderLine(o: InboundOrderApi): string {
  const dash = i18n.t('common.dash');
  const po = o.purchase_order?.order_number?.trim();
  if (po) {
    return i18n.t('warehouseInbound.linked.purchase', { orderNumber: po });
  }
  const so = o.sale_order?.order_number?.trim();
  if (so) {
    return i18n.t('warehouseInbound.linked.sale', { orderNumber: so });
  }
  const tr = o.transfer_order?.order_number?.trim();
  if (tr) {
    return i18n.t('warehouseInbound.linked.transfer', { orderNumber: tr });
  }
  return dash;
}

function supplierName(o: InboundOrderApi): string {
  return o.purchase_order?.supplier?.name?.trim() || i18n.t('common.dash');
}

export function inboundOrderToListRow(o: InboundOrderApi): InboundOrderListRow {
  const rowStatus = normalizeStatus(o.status);
  const items = o.items ?? [];
  const first = items[0];
  const prod = first?.product;
  const thumb = prod?.thumbnail_url?.trim() || prod?.image_url?.trim() || null;
  const dash = i18n.t('common.dash');
  const productName = prod?.name?.trim() || first?.sku?.trim() || dash;
  const second = items[1];
  const secondProd = second?.product;
  const productSecondLabel =
    items.length >= 2
      ? secondProd?.name?.trim() || second?.sku?.trim() || null
      : null;
  const moreProductsCount = items.length > 2 ? items.length - 2 : 0;

  const exp = num(o.total_expected_quantity);
  const rec = num(o.total_received_quantity);
  const dmg = num(o.total_damaged_quantity);
  let receiveProgressPct = 0;
  if (exp > 0) {
    receiveProgressPct = clampPct((rec / exp) * 100);
  } else if (o.is_fully_received) {
    receiveProgressPct = 100;
  }

  const qtyReceivedLabel =
    exp > 0
      ? i18n.t('warehouseInbound.listQty.received', { rec, exp })
      : items.length > 0
      ? i18n.t('warehouseInbound.listQty.linesOnly', { count: items.length })
      : dash;

  const damagedHint =
    dmg > 0 ? i18n.t('warehouseInbound.listQty.damaged', { count: dmg }) : '';

  return {
    id: o.id,
    uuid: o.uuid?.trim() ?? null,
    orderNumber: o.order_number?.trim() || `#${o.id}`,
    rowStatus,
    statusLabel: inboundOrderStatusLabel(o.status),
    typeLabel: inboundOrderTypeLabel(o),
    warehouseName: o.warehouse?.name?.trim() || dash,
    sellerName: o.seller?.name?.trim() || dash,
    linkedOrderLabel: linkedOrderLine(o),
    supplierName: supplierName(o),
    productLabel: productName,
    productSecondLabel,
    moreProductsCount,
    productThumb: thumb,
    receiveProgressPct,
    qtyReceivedLabel,
    damagedHint,
    noteSnippet: (o.note ?? '').trim().slice(0, 120),
    createdAtLabel: formatOrderDateLocale(o.created_at),
  };
}