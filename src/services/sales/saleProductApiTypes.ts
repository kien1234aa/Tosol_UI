/**
 * Giá từ API gợi ý sản phẩm:
 * - `"40000.00"` / số thập phân phương Tây → 40000 (không gộp `.` thành hàng nghìn).
 * - `"40.000"` / `"1.250.000"` (dấu chấm phân tách nghìn VN) → 40000 / 1250000.
 */
function parseSuggestionPriceVnd(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.max(0, Math.round(raw));
  }
  const s = String(raw ?? '').trim();
  if (!s) {
    return 0;
  }
  const normalized = s.replace(/\s/g, '').replace(',', '.');
  const parts = normalized.split('.').filter(Boolean);
  if (parts.length === 0) {
    return 0;
  }
  if (parts.length === 1) {
    const head = parts[0] ?? '';
    const n = Number.parseInt(head.replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  const last = parts[parts.length - 1] ?? '';
  if (last.length <= 2) {
    const whole = parts.slice(0, -1).join('');
    const n = Number.parseFloat(`${whole}.${last}`);
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  }
  const joined = parts.join('');
  const n = Number.parseInt(joined, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

/** Phần tử GET /products/suggestions */
export type ProductSuggestionApi = {
  id: number;
  sku: string;
  name: string;
  barcode: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  price: string | number;
  unit: string;
  available_stock: string;
};

export type ProductSuggestionsApiResponse = {
  success: boolean;
  message: string;
  data?: ProductSuggestionApi[];
};

/** Dùng trong modal chọn SP (UI). */
export type ShopProductRow = {
  id: number;
  name: string;
  price: number;
  sku?: string;
  availableStock?: number;
  /** Ảnh list: ưu tiên thumbnail, fallback image_url. */
  thumbUri?: string | null;
};

export function mapProductSuggestionToRow(
  row: ProductSuggestionApi,
): ShopProductRow {
  const price = parseSuggestionPriceVnd(row.price);
  const stock = Number(row.available_stock);
  const thumb =
    (typeof row.thumbnail_url === 'string' && row.thumbnail_url.trim()) ||
    (typeof row.image_url === 'string' && row.image_url.trim()) ||
    null;
  return {
    id: row.id,
    name: row.name,
    price,
    sku: row.sku,
    availableStock: Number.isFinite(stock) ? stock : 0,
    thumbUri: thumb,
  };
}
