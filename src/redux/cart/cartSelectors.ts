import { createSelector } from '@reduxjs/toolkit';
import {
  areAllItemsSelected,
  computeGrandGoodsTotal,
  computeGroupCosts,
  countCartProducts,
  hasAnySelectedItem,
} from '@/src/helpers/cart';
import type { RootState } from '@/src/redux/rootReducer';
import type { CartGroupViewModel } from '@/src/types/cart/cart.types';

const selectCartState = (state: RootState) => state.cart;

export const selectCartGroups = createSelector(
  selectCartState,
  state => state.groups,
);

export const selectCartGroupViewModels = createSelector(
  selectCartGroups,
  (groups): CartGroupViewModel[] =>
    groups.map(group => ({
      ...group,
      costs: computeGroupCosts(group),
    })),
);

export const selectCartGrandTotal = createSelector(selectCartGroups, groups =>
  computeGrandGoodsTotal(groups),
);

export const selectIsAllCartSelected = createSelector(selectCartGroups, groups =>
  areAllItemsSelected(groups),
);

export const selectHasSelectedCartItems = createSelector(
  selectCartGroups,
  groups => hasAnySelectedItem(groups),
);

export const selectCartBadgeCount = createSelector(selectCartGroups, groups =>
  countCartProducts(groups),
);
