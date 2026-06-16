import type { ComboAssemblyApi } from '@services/warehouse/comboAssemblyApiTypes';
import type {
  ComboAssemblyListRow,
  ComboAssemblyRowStatus,
} from '@features/comboAssembly/comboAssemblyTypes';

function normalizeStatus(
  raw: string | null | undefined,
): ComboAssemblyRowStatus {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'requested' || s === 'completed' || s === 'cancelled') {
    return s;
  }
  return 'other';
}

function requesterName(a: ComboAssemblyApi): string {
  return a.requested_by?.name?.trim() || a.requester?.name?.trim() || 'â€”';
}

function completerName(a: ComboAssemblyApi): string {
  return a.completed_by?.name?.trim() || a.completer?.name?.trim() || 'â€”';
}

/** Hiá»ƒn thá»‹ sá»‘ lÆ°á»£ng combo (vd. `10.000.000,00`). */
export function formatComboAssemblyQuantity(
  q: string | number | null | undefined,
): string {
  if (q == null) {
    return 'â€”';
  }
  const n = typeof q === 'number' ? q : parseFloat(String(q));
  if (!Number.isFinite(n)) {
    return String(q);
  }
  if (Math.abs(n - Math.round(n)) < 1e-9) {
    return Math.round(n).toLocaleString('vi-VN');
  }
  return n.toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatQty(q: string | number | null | undefined): string {
  return formatComboAssemblyQuantity(q);
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

/** NhĂ£n chiáº¿n lÆ°á»£c láº¥y hĂ ng (hiá»ƒn thá»‹ nhÆ° web). */
export function comboAssemblyPickStrategyLabel(
  raw: string | null | undefined,
): string {
  const s = (raw ?? '').toUpperCase().trim();
  if (s === 'FIFO') {
    return 'FIFO â€” Nháº­p trÆ°á»›c xuáº¥t trÆ°á»›c';
  }
  if (s === 'FEFO') {
    return 'FEFO â€” Háº¿t háº¡n trÆ°á»›c xuáº¥t trÆ°á»›c';
  }
  return s.length > 0 ? s : 'â€”';
}

export function comboAssemblyToListRow(
  a: ComboAssemblyApi,
): ComboAssemblyListRow {
  const p = a.product;
  const thumb = p?.thumbnail_url?.trim() || p?.image_url?.trim() || null;
  const rowStatus = normalizeStatus(a.status);
  const statusLabel =
    (a.status_label ?? '').trim() ||
    (rowStatus === 'requested'
      ? 'Chá» xá»­ lĂ½'
      : rowStatus === 'completed'
      ? 'ÄĂ£ \u0111Ă³ng gĂ³i'
      : rowStatus === 'cancelled'
      ? 'ÄĂ£ há»§y'
      : 'KhĂ¡c');

  return {
    id: a.id,
    uuid: a.uuid?.trim() ?? null,
    assemblyNumber: a.assembly_number?.trim() || `#${a.id}`,
    rowStatus,
    statusLabel,
    productName: p?.name?.trim() || 'â€”',
    sku: p?.sku?.trim() || 'â€”',
    productThumb: thumb,
    warehouseName:
      a.warehouse?.name?.trim() || a.warehouse?.code?.trim() || 'â€”',
    quantityLabel: formatQty(a.quantity),
    pickStrategy: (a.pick_strategy ?? 'â€”').toString().trim(),
    requesterName: requesterName(a),
    completerName: completerName(a),
    requestNoteSnippet: (a.request_note ?? '').trim().slice(0, 120),
    createdAtLabel: formatDateVi(a.created_at),
  };
}