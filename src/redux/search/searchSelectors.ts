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

export const selectFilteredSearchProducts = createSelector(
  [selectSearchProducts, selectSearchQuery],
  (products, query) => filterSearchProducts(products, query),
);
