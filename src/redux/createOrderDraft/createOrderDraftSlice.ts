import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { draftQuantityLimits, draftTaxRateLimits } from '@/src/configs/createOrder/draft.constants';
import { defaultCreateOrderFormState } from '@/src/configs/createOrder/createOrder.constants';
import {
  createDraftGroupId,
  createEmptyDraftOrder,
} from '@/src/helpers/createOrder/draft.helpers';
import { getAddDraftMaxQuantity } from '@/src/helpers/createOrder/draftProduct.helpers';
import type {
  AddDraftProductPayload,
  DraftOrder,
  DraftProductGroup,
} from '@/src/types/createOrderDraft/createOrderDraft.types';
import type { CreateOrderFormState } from '@/src/types/orders/createOrder.types';

export interface CreateOrderDraftState {
  drafts: DraftOrder[];
  activeDraftId: string | null;
}

const initialState: CreateOrderDraftState = {
  drafts: [],
  activeDraftId: null,
};

function touchDraft(draft: DraftOrder): void {
  draft.updatedAt = new Date().toISOString();
}

function findDraft(
  state: CreateOrderDraftState,
  draftId: string,
): DraftOrder | undefined {
  return state.drafts.find(item => item.id === draftId);
}

function removeEmptyDraftGroups(draft: DraftOrder): void {
  draft.groups = draft.groups.filter(group => group.products.length > 0);
}

function clampProductQuantity(quantity: number, maxStock?: number): number {
  const maxQuantity =
    maxStock != null && maxStock > 0
      ? Math.min(draftQuantityLimits.max, maxStock)
      : draftQuantityLimits.max;

  return Math.min(maxQuantity, Math.max(draftQuantityLimits.min, quantity));
}

function clampTaxRatePercent(value: number): number {
  return Math.min(
    draftTaxRateLimits.max,
    Math.max(draftTaxRateLimits.min, value),
  );
}

function addProductToDraft(
  draft: DraftOrder,
  payload: AddDraftProductPayload,
): void {
  const {
    productId,
    name,
    seller,
    priceCny,
    priceVnd,
    thumbnailUrl,
    sku,
    maxStock,
    isOutOfStock,
    quantity,
    variant,
    isCustomPricing = false,
  } = payload;

  let group = draft.groups.find(item => item.supplierName === seller);

  if (!group) {
    const newGroup: DraftProductGroup = {
      id: createDraftGroupId(),
      supplierName: seller,
      insurance: false,
      woodPacking: false,
      note: '',
      products: [],
    };
    draft.groups.push(newGroup);
    group = newGroup;
  }

  const existingProduct = group.products.find(item => item.id === productId);
  const maxQuantity = getAddDraftMaxQuantity(payload);

  if (existingProduct) {
    existingProduct.quantity = clampProductQuantity(
      existingProduct.quantity + quantity,
      maxQuantity,
    );
    if (!existingProduct.isCustomPricing && !existingProduct.isPriceOverridden) {
      existingProduct.priceCny = priceCny;
      existingProduct.priceVnd = priceVnd;
    }
    existingProduct.name = name;
    existingProduct.variant = variant;
    existingProduct.thumbnailUrl = thumbnailUrl;
    existingProduct.sku = sku;
    existingProduct.maxStock = maxStock;
    existingProduct.isOutOfStock = isOutOfStock;
  } else {
    group.products.push({
      id: productId,
      name,
      variant,
      priceCny,
      priceVnd,
      thumbnailUrl,
      sku,
      maxStock,
      isOutOfStock,
      quantity: clampProductQuantity(quantity, maxQuantity),
      isCustomPricing,
      taxRatePercent: 0,
    });
  }

  touchDraft(draft);
}

const createOrderDraftSlice = createSlice({
  name: 'createOrderDraft',
  initialState,
  reducers: {
    createDraft: {
      reducer(state, action: PayloadAction<DraftOrder>) {
        state.drafts.unshift(action.payload);
        state.activeDraftId = action.payload.id;
      },
      prepare() {
        return { payload: createEmptyDraftOrder(defaultCreateOrderFormState) };
      },
    },
    removeDraft(state, action: PayloadAction<string>) {
      state.drafts = state.drafts.filter(item => item.id !== action.payload);
      if (state.activeDraftId === action.payload) {
        state.activeDraftId = null;
      }
    },
    removeAllDrafts(state) {
      state.drafts = [];
      state.activeDraftId = null;
    },
    setActiveDraftId(state, action: PayloadAction<string | null>) {
      state.activeDraftId = action.payload;
    },
    setDraftForm(
      state,
      action: PayloadAction<{ draftId: string; form: CreateOrderFormState }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      if (!draft) {
        return;
      }

      draft.form = action.payload.form;
      touchDraft(draft);
    },
    toggleDraftGroupInsurance(
      state,
      action: PayloadAction<{ draftId: string; groupId: string }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      const group = draft?.groups.find(item => item.id === action.payload.groupId);
      if (group && draft) {
        group.insurance = !group.insurance;
        touchDraft(draft);
      }
    },
    toggleDraftGroupWoodPacking(
      state,
      action: PayloadAction<{ draftId: string; groupId: string }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      const group = draft?.groups.find(item => item.id === action.payload.groupId);
      if (group && draft) {
        group.woodPacking = !group.woodPacking;
        touchDraft(draft);
      }
    },
    setDraftGroupNote(
      state,
      action: PayloadAction<{
        draftId: string;
        groupId: string;
        note: string;
      }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      const group = draft?.groups.find(
        item => item.id === action.payload.groupId,
      );
      if (group && draft) {
        group.note = action.payload.note;
        touchDraft(draft);
      }
    },
    updateDraftProductQuantity(
      state,
      action: PayloadAction<{
        draftId: string;
        groupId: string;
        productId: string;
        quantity: number;
      }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      const group = draft?.groups.find(item => item.id === action.payload.groupId);
      const product = group?.products.find(
        item => item.id === action.payload.productId,
      );
      if (!product || !draft) {
        return;
      }

      product.quantity = clampProductQuantity(
        action.payload.quantity,
        product.maxStock,
      );
      touchDraft(draft);
    },
    updateDraftProductUnitPrice(
      state,
      action: PayloadAction<{
        draftId: string;
        groupId: string;
        productId: string;
        unitPriceVnd: number;
      }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      const group = draft?.groups.find(item => item.id === action.payload.groupId);
      const product = group?.products.find(
        item => item.id === action.payload.productId,
      );
      if (!product || !draft) {
        return;
      }

      product.priceVnd = Math.max(0, Math.round(action.payload.unitPriceVnd));
      product.priceCny = 0;
      product.isPriceOverridden = true;
      touchDraft(draft);
    },
    updateDraftProductTaxRate(
      state,
      action: PayloadAction<{
        draftId: string;
        groupId: string;
        productId: string;
        taxRatePercent: number;
      }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      const group = draft?.groups.find(item => item.id === action.payload.groupId);
      const product = group?.products.find(
        item => item.id === action.payload.productId,
      );
      if (!product || !draft) {
        return;
      }

      product.taxRatePercent = clampTaxRatePercent(action.payload.taxRatePercent);
      touchDraft(draft);
    },
    removeDraftProduct(
      state,
      action: PayloadAction<{
        draftId: string;
        groupId: string;
        productId: string;
      }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      const group = draft?.groups.find(item => item.id === action.payload.groupId);
      if (!group || !draft) {
        return;
      }

      group.products = group.products.filter(
        product => product.id !== action.payload.productId,
      );
      removeEmptyDraftGroups(draft);
      touchDraft(draft);
    },
    removeDraftGroup(
      state,
      action: PayloadAction<{ draftId: string; groupId: string }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      if (!draft) {
        return;
      }

      draft.groups = draft.groups.filter(
        group => group.id !== action.payload.groupId,
      );
      touchDraft(draft);
    },
    addDraftProduct(
      state,
      action: PayloadAction<{ draftId: string; payload: AddDraftProductPayload }>,
    ) {
      const draft = findDraft(state, action.payload.draftId);
      if (!draft) {
        return;
      }

      addProductToDraft(draft, action.payload.payload);
      state.activeDraftId = action.payload.draftId;
    },
    ensureDraftWithProduct(
      state,
      action: PayloadAction<AddDraftProductPayload>,
    ) {
      let draft =
        (state.activeDraftId
          ? findDraft(state, state.activeDraftId)
          : undefined) ?? state.drafts[0];

      if (!draft) {
        draft = createEmptyDraftOrder(defaultCreateOrderFormState);
        state.drafts.unshift(draft);
      }

      addProductToDraft(draft, action.payload);
      state.activeDraftId = draft.id;
    },
    resetDraftState() {
      return initialState;
    },
    hydrateDraftState(
      state,
      action: PayloadAction<CreateOrderDraftState>,
    ) {
      state.drafts = action.payload.drafts;
      state.activeDraftId = action.payload.activeDraftId;
    },
  },
});

export const {
  createDraft,
  removeDraft,
  removeAllDrafts,
  setActiveDraftId,
  setDraftForm,
  toggleDraftGroupInsurance,
  toggleDraftGroupWoodPacking,
  setDraftGroupNote,
  updateDraftProductQuantity,
  updateDraftProductUnitPrice,
  updateDraftProductTaxRate,
  removeDraftProduct,
  removeDraftGroup,
  addDraftProduct,
  ensureDraftWithProduct,
  resetDraftState,
  hydrateDraftState,
} = createOrderDraftSlice.actions;
export const createOrderDraftReducer = createOrderDraftSlice.reducer;
