import { formatDateTimeVi } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { PurchaseOrderAttachmentApi } from '@services/warehouse/purchaseOrderApiTypes';

export type PurchaseOrderAttachmentRow = {
  id: number;
  name: string;
  url: string | null;
  uploaderName: string | null;
  createdAtDisplay: string | null;
  metaLine: string | null;
};

function attachmentName(a: PurchaseOrderAttachmentApi): string {
  const n = (a.original_name ?? a.file_name ?? '').trim();
  return n.length > 0 ? n : `#${a.id}`;
}

function formatFileSize(size: number | string | null | undefined): string | null {
  if (size == null || size === '') {
    return null;
  }
  const n = Number(size);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  if (n < 1024) {
    return `${Math.round(n)} B`;
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(1)} KB`;
  }
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeShort(mime: string | null | undefined): string | null {
  const m = (mime ?? '').trim();
  if (!m) {
    return null;
  }
  const parts = m.split('/');
  return parts.length === 2 ? parts[1].toUpperCase() : m;
}

export function purchaseOrderAttachmentToRow(
  a: PurchaseOrderAttachmentApi,
): PurchaseOrderAttachmentRow {
  const url = (a.url ?? '').trim() || null;
  const uploaderName = a.uploader?.name?.trim() || null;
  const createdAtDisplay = (() => {
    const formatted = formatDateTimeVi(a.created_at ?? null);
    return formatted !== '—' ? formatted : null;
  })();
  const metaParts = [
    mimeShort(a.mime_type),
    formatFileSize(a.size),
    uploaderName ? `Tải bởi ${uploaderName}` : null,
  ].filter((p): p is string => p != null && p.length > 0);

  return {
    id: a.id,
    name: attachmentName(a),
    url,
    uploaderName,
    createdAtDisplay,
    metaLine: metaParts.length > 0 ? metaParts.join(' · ') : null,
  };
}
