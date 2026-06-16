import { formatDateTimeVi } from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { PaymentAttachmentApi } from '@services/finance/paymentApiTypes';

export type PaymentAttachmentRow = {
  id: number;
  name: string;
  url: string | null;
  createdAtDisplay: string | null;
  metaLine: string | null;
};

function attachmentName(a: PaymentAttachmentApi): string {
  const n = (a.original_name ?? a.file_name ?? '').trim();
  return n.length > 0 ? n : `#${a.id}`;
}

export function paymentAttachmentToRow(
  a: PaymentAttachmentApi,
): PaymentAttachmentRow {
  const url = (a.url ?? '').trim() || null;
  const uploaderName = a.uploader?.name?.trim() || null;
  const createdAtDisplay = (() => {
    const formatted = formatDateTimeVi(a.created_at ?? null);
    return formatted !== '—' ? formatted : null;
  })();
  const metaParts = [
    uploaderName ? `Tải bởi ${uploaderName}` : null,
    createdAtDisplay,
  ].filter((p): p is string => p != null && p.length > 0);

  return {
    id: a.id,
    name: attachmentName(a),
    url,
    createdAtDisplay,
    metaLine: metaParts.length > 0 ? metaParts.join(' · ') : null,
  };
}
