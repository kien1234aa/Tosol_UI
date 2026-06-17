import { createSelector } from '@reduxjs/toolkit';
import { filterSearchProducts } from '@/src/helpers/search';
import type { RootState } from '@/src/redux/rootReducer';

const selectSearchState = (state: RootState) => state.search;

export const selectSearchQuery = createSelector(
  selectSearchState,
  state => state.query,
);

export const selectSearchPlatform = createSelector(
  selectSearchState,
  state => state.selectedPlatform,
);

export const selectSearchProducts = createSelector(
  selectSearchState,
  state => state.products,
);

export const selectSearchProductsStatus = createSelector(
  selectSearchState,
  state => state.productsStatus,
);

export const selectSearchProductsError = createSelector(
  selectSearchState,
  state => state.productsError,
);

export const selectSearchCurrentPage = createSelector(
  selectSearchState,
  state => state.currentPage,
);

export const selectSearchLastPage = createSelector(
  selectSearchState,
  state => state.lastPage,
);

export const selectHasMoreSearchProducts = createSelector(
  selectSearchCurrentPage,
  selectSearchLastPage,
  (currentPage, lastPage) => lastPage > 0 && currentPage < lastPage,
);

export const selectIsLoadingSearchProducts = createSelector(
  selectSearchProductsStatus,
  status => status === 'loading',
);

export const selectIsLoadingMoreSearchProducts = createSelector(
  selectSearchProductsStatus,
  status => status === 'loadingMore',
);

export const selectProductDetail = createSelector(
  selectSearchState,
  state => state.productDetail,
);

export const selectProductDetailStatus = createSelector(
  selectSearchState,
  state => state.productDetailStatus,
);

export const selectProductDetailError = createSelector(
  selectSearchState,
  state => state.productDetailError,
);

export const selectIsLoadingProductDetail = createSelector(
  selectProductDetailStatus,
  status => status === 'loading',
);

export const selectFilteredSearchProducts = createSelector(
  [selectSearchProducts, selectSearchQuery],
  (products, query) => filterSearchProducts(products, query),
);
