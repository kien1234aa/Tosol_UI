/**
 * Chuẩn hoá `action_url` từ API / FCM: đường dẫn tương đối, URL đầy đủ, hoặc có tiền tố `api/v1/`.
 */
export function parseNotificationTarget(
  actionUrl: string | null,
): { kind: string; slug: string } | null {
  if (actionUrl == null || actionUrl.trim() === '') {
    return null;
  }
  let path = actionUrl.trim();
  if (/^https?:\/\//i.test(path)) {
    try {
      path = path.replace(/^https?:\/\/[^/?#]+/, '') || '';
    } catch {
      return null;
    }
  }
  path = path.replace(/^\/+/, '');
  const q = path.indexOf('?');
  if (q >= 0) {
    path = path.slice(0, q);
  }
  const hash = path.indexOf('#');
  if (hash >= 0) {
    path = path.slice(0, hash);
  }
  if (path.startsWith('api/v1/')) {
    path = path.slice('api/v1/'.length);
  }
  const segments = path.split('/').filter(Boolean);
  if (segments.length < 2) {
    return null;
  }
  let kind = segments[0]!;
  const slug = segments.slice(1).join('/');
  if (!slug) {
    return null;
  }
  // Một số endpoint Laravel dùng snake_case trong `action_url` (đồng bộ admin / quản lý kho).
  const KIND_SNAKE_TO_KEBAB: Record<string, string> = {
    inbound_orders: 'inbound-orders',
    packing_orders: 'packing-orders',
    outbound_orders: 'outbound-orders',
    transfer_orders: 'transfer-orders',
    sale_orders: 'sale-orders',
  };
  const mapped = KIND_SNAKE_TO_KEBAB[kind];
  if (mapped != null) {
    kind = mapped;
  }
  return { kind, slug };
}
