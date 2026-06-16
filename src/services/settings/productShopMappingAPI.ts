import axios from 'axios';
import api from '@shared/services/api';
import type {
  ProductShopMappingApi,
  ProductShopMappingsApiResponse,
  ProductShopMappingsMeta,
} from './productShopMappingApiTypes';

export const PRODUCT_SHOP_MAPPINGS_LIST_INCLUDE = 'product';

export type GetProductShopMappingsParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  filterShopId: number;
  signal?: AbortSignal;
};

export type ProductShopMappingsPageResult = {
  items: ProductShopMappingApi[];
  meta: ProductShopMappingsMeta | null;
};

function buildQueryParams(
  p: GetProductShopMappingsParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 15,
    sort = '-created_at',
    include = PRODUCT_SHOP_MAPPINGS_LIST_INCLUDE,
    filterShopId,
  } = p;

  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
    include,
    'filter[shop_id]': filterShopId,
  };

  return params;
}

export async function getProductShopMappingsPage(
  params: GetProductShopMappingsParams,
): Promise<ProductShopMappingsPageResult> {
  try {
    const { data } = await api.get<ProductShopMappingsApiResponse>(
      '/product-shop-mappings',
      {
        params: buildQueryParams(params),
        signal: params.signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được liên kết sản phẩm',
      );
    }
    return {
      items: data.data ?? [],
      meta: data.meta ?? null,
    };
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không tải được liên kết sản phẩm');
  }
}
