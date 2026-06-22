export {
  setSearchQuery,
  setSearchPlatform,
  resetSearchState,
  searchReducer,
} from './searchSlice';
export type {
  ProductDetailStatus,
  SearchProductsStatus,
  SearchState,
} from './searchSlice';
export {
  fetchProductDetailThunk,
  fetchProductsThunk,
} from './searchThunks';
export type { FetchProductsPayload, FetchProductsResult } from './searchThunks';
export {
  selectSearchQuery,
  selectSearchPlatform,
  selectSearchProducts,
  selectSearchProductsStatus,
  selectSearchProductsError,
  selectSearchCurrentPage,
  selectSearchLastPage,
  selectHasMoreSearchProducts,
  selectIsLoadingSearchProducts,
  selectIsLoadingMoreSearchProducts,
  selectSearchProductsHasCache,
  selectProductDetail,
  selectProductDetailStatus,
  selectProductDetailError,
  selectIsLoadingProductDetail,
  selectFilteredSearchProducts,
} from './searchSelectors';
