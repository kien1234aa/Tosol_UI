import { getJson, getJsonPaginated } from '@/src/apis/http';
import {
  apiEndpoints,
  productDetailIncludes,
  productsPageSize,
} from '@/src/configs/api';
import type {
  ProductApiItem,
  ProductDetailApiItem,
  ProductsListResult,
  ProductsPaginationMeta,
} from '@/src/types/products';

export interface IProductsService {
  list(page?: number, perPage?: number): Promise<ProductsListResult>;
  getById(productId: string | number): Promise<ProductDetailApiItem>;
}

class HttpProductsService implements IProductsService {
  async list(
    page = 1,
    perPage = productsPageSize,
  ): Promise<ProductsListResult> {
    const { data, meta } = await getJsonPaginated<ProductApiItem[]>(
      apiEndpoints.products,
      { page, per_page: perPage },
    );

    return {
      products: data,
      meta: meta as ProductsPaginationMeta,
    };
  }

  async getById(productId: string | number): Promise<ProductDetailApiItem> {
    return getJson<ProductDetailApiItem>(
      `${apiEndpoints.products}/${productId}`,
      { include: productDetailIncludes },
    );
  }
}

export const productsService: IProductsService = new HttpProductsService();
