import { createSelector } from '@reduxjs/toolkit';
import { draftCopy } from '@/src/configs/createOrder/draft.constants';
import {
  computeGrandGoodsTotal,
  computeGroupCosts,
  countDraftProducts,
  formatVndPrice,
} from '@/src/helpers/createOrder';
import type { RootState } from '@/src/redux/rootReducer';
import type {
  DraftOrderSummary,
  DraftProductGroup,
  DraftProductGroupViewModel,
} from '@/src/types/createOrderDraft/createOrderDraft.types';

const EMPTY_DRAFT_GROUPS: DraftProductGroup[] = [];

/** Stable empty list for useAppSelector when no draft is active. */
export const selectEmptyDraftGroups = (_state: RootState): DraftProductGroup[] =>
  EMPTY_DRAFT_GROUPS;

const selectCreateOrderDraftState = (state: RootState) => state.createOrderDraft;

export const selectDraftOrders = createSelector(
  selectCreateOrderDraftState,
  state =>
    [...state.drafts].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    ),
);

export const selectActiveDraftId = createSelector(
  selectCreateOrderDraftState,
  state => state.activeDraftId,
);

export const selectDraftOrderCount = createSelector(
  selectDraftOrders,
  drafts => drafts.length,
);

export const selectDraftSummaries = createSelector(
  selectDraftOrders,
  (drafts): DraftOrderSummary[] =>
    drafts.map((draft, index) => {
      const productCount = countDraftProducts(draft.groups);
      const goodsTotalVnd = computeGrandGoodsTotal(draft.groups);

      return {
        id: draft.id,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        productCount,
        goodsTotalVnd,
        title:
          productCount > 0
            ? `${draftCopy.draftListItemTitle} ${drafts.length - index}`
            : draftCopy.draftListNewOrder,
        subtitle:
          productCount > 0
            ? `${productCount} ${draftCopy.draftListProductCountLabel} · ${formatVndPrice(goodsTotalVnd)}`
            : draftCopy.draftListEmptyProducts,
      };
    }),
);

export const makeSelectDraftById = (draftId: string) =>
  createSelector(selectDraftOrders, drafts =>
    drafts.find(item => item.id === draftId),
  );

export const makeSelectDraftGroups = (draftId: string) =>
  createSelector(
    makeSelectDraftById(draftId),
    draft => draft?.groups ?? EMPTY_DRAFT_GROUPS,
  );

export const makeSelectDraftGroupViewModels = (draftId: string) =>
  createSelector(makeSelectDraftGroups(draftId), (groups): DraftProductGroupViewModel[] =>
    groups.map(group => ({
      ...group,
      costs: computeGroupCosts(group),
    })),
  );

export const makeSelectDraftGrandTotal = (draftId: string) =>
  createSelector(makeSelectDraftGroups(draftId), groups =>
    computeGrandGoodsTotal(groups),
  );

export const makeSelectHasDraftProducts = (draftId: string) =>
  createSelector(makeSelectDraftGroups(draftId), groups =>
    groups.some(group => group.products.length > 0),
  );

/** @deprecated Use makeSelectDraftGroups(draftId) */
export const selectDraftGroups = createSelector(
  selectCreateOrderDraftState,
  state => state.drafts[0]?.groups ?? [],
);

export const selectDraftProductCount = createSelector(
  selectDraftOrders,
  drafts =>
    drafts.reduce(
      (total, draft) => total + countDraftProducts(draft.groups),
      0,
    ),
);

export const selectHasDraftProducts = createSelector(
  selectDraftOrders,
  drafts =>
    drafts.some(draft =>
      draft.groups.some(group => group.products.length > 0),
    ),
);

export const selectDraftGroupViewModels = makeSelectDraftGroupViewModels('');

export const selectDraftGrandTotal = createSelector(
  selectDraftOrders,
  drafts =>
    drafts.reduce(
      (total, draft) => total + computeGrandGoodsTotal(draft.groups),
      0,
    ),
);
