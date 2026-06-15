export {
  setSearchQuery,
  setSearchPlatform,
  resetSearchState,
  searchReducer,
} from './searchSlice';
export type { SearchState } from './searchSlice';
export {
  selectSearchQuery,
  selectSearchPlatform,
  selectSearchProducts,
  selectFilteredSearchProducts,
} from './searchSelectors';
