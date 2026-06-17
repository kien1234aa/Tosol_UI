import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultSearchPlatform } from '@/src/configs/search';
import { fetchProductDetailThunk, fetchProductsThunk } from './searchThunks';
import type {
  SearchPlatformKey,
  SearchProduct,
} from '@/src/types/search/search.types';

export type SearchProductsStatus =
  | 'idle'
  | 'loading'
  | 'loadingMore'
  | 'success'
  | 'error';

export type ProductDetailStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SearchState {
  query: string;
  selectedPlatform: SearchPlatformKey;
  products: SearchProduct[];
  productsStatus: SearchProductsStatus;
  productsError: string | null;
  currentPage: number;
  lastPage: number;
  totalProducts: number;
  productDetail: SearchProduct | null;
  productDetailId: string | null;
  productDetailStatus: ProductDetailStatus;
  productDetailError: string | null;
}

const initialState: SearchState = {
  query: '',
  selectedPlatform: defaultSearchPlatform,
  products: [],
  productsStatus: 'idle',
  productsError: null,
  currentPage: 0,
  lastPage: 0,
  totalProducts: 0,
  productDetail: null,
  productDetailId: null,
  productDetailStatus: 'idle',
  productDetailError: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setSearchPlatform(state, action: PayloadAction<SearchPlatformKey>) {
      state.selectedPlatform = action.payload;
    },
    resetSearchState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProductsThunk.pending, (state, action) => {
        state.productsError = null;
        state.productsStatus = action.meta.arg.append ? 'loadingMore' : 'loading';
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.productsStatus = 'success';
        state.productsError = null;
        state.currentPage = action.payload.meta.current_page;
        state.lastPage = action.payload.meta.last_page;
        state.totalProducts = action.payload.meta.total;
        state.products = action.payload.append
          ? [...state.products, ...action.payload.products]
          : action.payload.products;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        if (action.meta.condition === false) {
          return;
        }

        state.productsStatus =
          state.products.length > 0 ? 'success' : 'error';
        state.productsError = action.payload ?? 'Không thể tải sản phẩm';
      })
      .addCase(fetchProductDetailThunk.pending, (state, action) => {
        state.productDetailStatus = 'loading';
        state.productDetailError = null;
        state.productDetailId = action.meta.arg;

        if (state.productDetail?.id !== action.meta.arg) {
          state.productDetail = null;
        }
      })
      .addCase(fetchProductDetailThunk.fulfilled, (state, action) => {
        state.productDetailStatus = 'success';
        state.productDetailError = null;
        state.productDetail = action.payload;
        state.productDetailId = action.payload.id;

        const index = state.products.findIndex(
          item => item.id === action.payload.id,
        );

        if (index >= 0) {
          state.products[index] = action.payload;
        }
      })
      .addCase(fetchProductDetailThunk.rejected, (state, action) => {
        state.productDetailStatus = 'error';
        state.productDetailError =
          action.payload ?? 'Không thể tải chi tiết sản phẩm';
      });
  },
});

export const { setSearchQuery, setSearchPlatform, resetSearchState } =
  searchSlice.actions;
export const searchReducer = searchSlice.reducer;
