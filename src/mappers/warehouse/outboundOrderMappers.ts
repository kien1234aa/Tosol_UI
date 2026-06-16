import i18n from '@shared/i18n';
import { formatOrderDateLocale } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { OutboundOrderApi } from '@services/warehouse/outboundOrderApiTypes';
import type {
  OutboundOrderListRow,
  OutboundOrderRowStatus,
} from '@features/outbound/outboundOrderTypes';

function normalizeStatus(
  raw: string | null | undefined,
): OutboundOrderRowStatus {
  const s = (raw ?? '').toLowerCase().trim();
  if (
    s === 'pending' ||
    s === 'picking' ||
    s === 'ready' ||
    s === 'completed' ||
    s === 'cancelled'
  ) {
    return s;
  }
  return 'other';
}

/** NhĂ£n tráº¡ng thĂ¡i phiáº¿u xuáº¥t kho (danh sĂ¡ch + chi tiáº¿t). */
export function outboundOrderStatusLabel(
  raw: string | null | undefined,
): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (
    s === 'pending' ||
    s === 'picking' ||
    s === 'ready' ||
    s === 'completed' ||
    s === 'cancelled'
  ) {
    return i18n.t(`warehouseOutbound.status.${s}`);
  }
  return raw?.trim() ? raw.trim() : i18n.t('warehouseOutbound.statusOther');
}

/** NhĂ£n loáº¡i xuáº¥t (bĂ¡n / chuyá»ƒn / tráº£ / thanh lĂ½). */
export function outboundOrderTypeLabel(o: OutboundOrderApi): string {
  if (o.is_transfer) {
    return i18n.t('warehouseOutbound.type.transfer');
  }
  if (o.is_return) {
    return i18n.t('warehouseOutbound.type.return');
  }
  if (o.is_disposal) {
    return i18n.t('warehouseOutbound.type.disposal');
  }
  const t = (o.type ?? '').toLowerCase().trim();
  if (t === 'sale' || t === 'transfer' || t === 'return' || t === 'disposal') {
    return i18n.t(`warehouseOutbound.type.${t}`);
  }
  return o.type?.trim()
    ? o.type.trim()
    : i18n.t('warehouseOutbound.typeFallback');
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

function linkedOrderLine(o: OutboundOrderApi): string {
  const dash = i18n.t('common.dash');
  const so = o.sale_order?.order_number?.trim();
  if (so) {
    return i18n.t('warehouseOutbound.linked.saleOrder', { orderNumber: so });
  }
  const tr = o.transfer_order?.order_number?.trim();
  if (tr) {
    return i18n.t('warehouseOutbound.linked.transfer', { orderNumber: tr });
  }
  const src = o.source_outbound_order?.order_number?.trim();
  if (src) {
    const wh = o.source_outbound_order?.warehouse?.name?.trim();
    return wh
      ? i18n.t('warehouseOutbound.linked.sourceWarehouse', {
          orderNumber: src,
          warehouse: wh,
        })
      : i18n.t('warehouseOutbound.linked.source', { orderNumber: src });
  }
  return dash;
}

export function outboundOrderToListRow(
  o: OutboundOrderApi,
): OutboundOrderListRow {
  const rowStatus = normalizeStatus(o.status);
  const items = o.items ?? [];
  const first = items[0];
  const prod = first?.product;
  const thumb = prod?.thumbnail_url?.trim() || prod?.image_url?.trim() || null;
  const productName = prod?.name?.trim() || first?.sku?.trim() || 'â€”';
  const second = items[1];
  const secondProd = second?.product;
  const productSecondLabel =
    items.length >= 2
      ? secondProd?.name?.trim() || second?.sku?.trim() || null
      : null;
  const moreProductsCount = items.length > 2 ? items.length - 2 : 0;

  const totalQ = num(o.total_quantity);
  const pickedQ = num(o.total_picked_quantity);

  return {
    id: o.id,
    uuid: o.uuid?.trim() ?? null,
    orderNumber: o.order_number?.trim() || `#${o.id}`,
    rowStatus,
    statusLabel: outboundOrderStatusLabel(o.status),
    typeLabel: outboundOrderTypeLabel(o),
    warehouseName: o.warehouse?.name?.trim() || 'â€”',
    sellerName: o.seller?.name?.trim() || 'â€”',
    linkedOrderLabel: linkedOrderLine(o),
    productLabel: productName,
    productSecondLabel,
    moreProductsCount,
    productThumb: thumb,
    pickProgressPct: clampPct(num(o.pick_progress)),
    qtyPickedLabel:
      totalQ > 0
        ? i18n.t('warehouseOutbound.listQty.picked', {
            picked: pickedQ,
            total: totalQ,
          })
        : i18n.t('warehouseOutbound.listQty.linesOnly', {
            count: items.length,
          }),
    recipientLabel: (o.recipient_name ?? '').trim() || 'â€”',
    requiresPacking: Boolean(o.requires_packing),
    noteSnippet: (o.note ?? '').trim().slice(0, 120),
    createdAtLabel: formatOrderDateLocale(o.created_at),
  };
}