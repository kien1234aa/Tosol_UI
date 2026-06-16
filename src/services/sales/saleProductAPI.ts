import api from '@shared/services/api';
import type { ProductSuggestionsApiResponse } from './saleProductApiTypes';
import {
  mapProductSuggestionToRow,
  type ShopProductRow,
} from './saleProductApiTypes';
export type FetchProductSuggestionsParams = {
  /** Gửi khi đã chọn cửa hàng (một số backend lọc theo shop). */
  shopId?: number | null;
  /** GET /products/suggestions?warehouse_id= — tồn kho / gợi ý theo kho (vd. phiếu xuất). */
  warehouseId?: number | null;
  /** Chuỗi tìm (tuỳ API). */
  search?: string;
  signal?: AbortSignal;
};

export async function fetchProductSuggestions({
  shopId,
  warehouseId,
  search,
  signal,
}: FetchProductSuggestionsParams): Promise<ShopProductRow[]> {
  const response = await api.get<ProductSuggestionsApiResponse>(
    '/products/suggestions',
    {
      params: {
        ...(shopId != null ? { shop_id: shopId } : {}),
        ...(warehouseId != null ? { warehouse_id: warehouseId } : {}),
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
      signal,
    },
  );
  const body = response.data;
  if (!body.success || !Array.isArray(body.data)) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Không tải được gợi ý sản phẩm',
    );
  }
  return body.data.map(mapProductSuggestionToRow);
}

export type { ShopProductRow } from './saleProductApiTypes';
