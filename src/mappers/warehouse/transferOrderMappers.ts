import type { TransferOrderApi } from '@services/warehouse/transferOrderApiTypes';
import type {
  TransferOrderListRow,
  TransferOrderRowStatus,
} from '@features/transfer/transferOrderTypes';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chá» xá»­ lĂ½',
  in_transit: 'Äang chuyá»ƒn',
  receiving: 'Äang nháº­n',
  completed: 'HoĂ n thĂ nh',
  cancelled: 'ÄĂ£ há»§y',
};

function normalizeStatus(
  raw: string | null | undefined,
): TransferOrderRowStatus {
  const s = (raw ?? '').toLowerCase().trim();
  if (
    s === 'pending' ||
    s === 'in_transit' ||
    s === 'receiving' ||
    s === 'completed' ||
    s === 'cancelled'
  ) {
    return s;
  }
  return 'other';
}

/** NhĂ£n tráº¡ng thĂ¡i lá»‡nh chuyá»ƒn kho (danh sĂ¡ch + chi tiáº¿t). */
export function transferOrderStatusLabel(
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

function firstOutbound(t: TransferOrderApi) {
  const list = t.outbound_orders ?? [];
  return list[0] ?? null;
}

function productSummary(t: TransferOrderApi): {
  label: string;
  thumb: string | null;
} {
  const ob = firstOutbound(t);
  if (ob) {
    const so = ob.sale_order?.order_number?.trim();
    const items = ob.items ?? [];
    const firstSku = items[0]?.sku?.trim();
    if (so && firstSku) {
      return { label: `${firstSku} Â· ÄÆ¡n ${so}`, thumb: null };
    }
    if (so) {
      return { label: `ÄÆ¡n bĂ¡n ${so}`, thumb: null };
    }
    const on = ob.order_number?.trim();
    if (on && firstSku) {
      return { label: `${firstSku} Â· ${on}`, thumb: null };
    }
    if (on) {
      return { label: `Xuáº¥t ${on}`, thumb: null };
    }
  }
  const ib = (t.inbound_orders ?? [])[0];
  if (ib?.order_number?.trim()) {
    return { label: `Nháº­p ${ib.order_number.trim()}`, thumb: null };
  }
  const tq = num(t.total_quantity);
  const ti = num(t.total_items);
  if (tq > 0 || ti > 0) {
    return {
      label: `${ti > 0 ? `${Math.round(ti)} dĂ²ng` : 'HĂ ng'} Â· SL ${tq}`,
      thumb: null,
    };
  }
  return { label: 'â€”', thumb: null };
}

function scanProgressLabel(t: TransferOrderApi): string {
  const boxes = num(t.total_boxes_count);
  if (boxes > 0) {
    const scanned = num(t.scanned_boxes_count);
    return `ThĂ¹ng quĂ©t ${scanned}/${boxes}`;
  }
  const tiq = num(t.total_items_quantity);
  if (tiq > 0) {
    const siq = num(t.scanned_items_quantity);
    return `HĂ ng quĂ©t ${siq}/${tiq}`;
  }
  const obc = num(t.outbound_orders_count);
  const ibc = num(t.inbound_orders_count);
  if (obc > 0 || ibc > 0) {
    return `${obc} lá»‡nh xuáº¥t Â· ${ibc} lá»‡nh nháº­p`;
  }
  return 'â€”';
}

export function transferOrderToListRow(
  t: TransferOrderApi,
): TransferOrderListRow {
  const from =
    t.from_warehouse?.name?.trim() || t.from_warehouse?.code?.trim() || 'â€”';
  const to =
    t.to_warehouse?.name?.trim() || t.to_warehouse?.code?.trim() || 'â€”';
  const creator = t.creator?.name?.trim() || 'â€”';
  const driver = (t.driver_name ?? '').trim();
  const phone = (t.driver_phone ?? '').trim();
  const driverLine =
    driver.length > 0
      ? phone.length > 0
        ? `${driver} Â· ${phone}`
        : driver
      : phone || 'â€”';

  const obc = num(t.outbound_orders_count);
  const ibc = num(t.inbound_orders_count);
  const linkedOrdersLabel = `${obc} xuáº¥t Â· ${ibc} nháº­p`;

  const { label: productLabel, thumb: productThumb } = productSummary(t);

  const tq = num(t.total_quantity);
  const tw = num(t.total_weight);
  const qtyWeightLabel =
    tw > 0 ? `${tq} SL Â· ${tw.toLocaleString('vi-VN')} g` : `${tq} SL`;

  return {
    id: t.id,
    uuid: t.uuid?.trim() ?? null,
    orderNumber: t.order_number?.trim() || `#${t.id}`,
    rowStatus: normalizeStatus(t.status),
    statusLabel: transferOrderStatusLabel(t.status),
    routeLabel: `${from} â†’ ${to}`,
    creatorName: creator,
    driverLine,
    linkedOrdersLabel,
    productLabel,
    productThumb,
    scanProgressLabel: scanProgressLabel(t),
    qtyWeightLabel,
    noteSnippet: (t.note ?? '').trim().slice(0, 120),
    createdAtLabel: formatDateVi(t.created_at),
  };
}