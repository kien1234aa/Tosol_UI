import { createAsyncThunk } from '@reduxjs/toolkit';
import { productsService } from '@/src/apis/products';
import {
  mapApiProductDetailToSearchProduct,
  mapApiProductToSearchProduct,
} from '@/src/helpers/search';
import type { ProductsPaginationMeta } from '@/src/types/products';
import type { SearchProduct } from '@/src/types/search/search.types';
import type { RootState } from '../rootReducer';

export interface FetchProductsPayload {
  page: number;
  append: boolean;
  force?: boolean;
}

export interface FetchProductsResult {
  products: SearchProduct[];
  meta: ProductsPaginationMeta;
  page: number;
  append: boolean;
}

export const fetchProductsThunk = createAsyncThunk<
  FetchProductsResult,
  FetchProductsPayload,
  { rejectValue: string; state: RootState }
>(
  'search/fetchProducts',
  async ({ page, append }, { rejectWithValue }) => {
    try {
      const { products, meta } = await productsService.list({ page });

      return {
        products: products.map(mapApiProductToSearchProduct),
        meta,
        page,
        append,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tải sản phẩm';
      return rejectWithValue(message);
    }
  },
  {
    condition: ({ page, append, force }, { getState }) => {
      const { productsStatus, currentPage, lastPage } = getState().search;

      if (productsStatus === 'loading' || productsStatus === 'loadingMore') {
        return false;
      }

      if (
        !force &&
        !append &&
        page === 1 &&
        productsStatus === 'success' &&
        currentPage > 0
      ) {
        return false;
      }

      if (append && currentPage >= lastPage) {
        return false;
      }

      if (append && page !== currentPage + 1) {
        return false;
      }

      return true;
    },
  },
);

export const fetchProductDetailThunk = createAsyncThunk<
  SearchProduct,
  string,
  { rejectValue: string }
>('search/fetchProductDetail', async (productId, { rejectWithValue }) => {
  try {
    const product = await productsService.getById(productId);
    return mapApiProductDetailToSearchProduct(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Không thể tải chi tiết sản phẩm';
    return rejectWithValue(message);
  }
});
