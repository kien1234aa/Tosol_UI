import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cartQuantityLimits } from '@/src/configs/cart';
import { createCartGroupId } from '@/src/helpers/cart';
import { getAddToCartMaxQuantity } from '@/src/helpers/search/cart.helpers';
import type { AddToCartPayload, CartGroup } from '@/src/types/cart/cart.types';

export interface CartState {
  groups: CartGroup[];
}

const initialState: CartState = {
  groups: [],
};

function removeEmptyCartGroups(state: CartState): void {
  state.groups = state.groups.filter(group => group.products.length > 0);
}

function clampProductQuantity(
  quantity: number,
  maxStock?: number,
): number {
  const maxQuantity =
    maxStock != null && maxStock > 0
      ? Math.min(cartQuantityLimits.max, maxStock)
      : cartQuantityLimits.max;

  return Math.min(maxQuantity, Math.max(cartQuantityLimits.min, quantity));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleSelectAllCart(state, action: PayloadAction<boolean>) {
      state.groups.forEach(group => {
        group.selected = action.payload;
        group.products.forEach(product => {
          product.selected = action.payload;
        });
      });
    },
    toggleCartGroupSelected(state, action: PayloadAction<string>) {
      const group = state.groups.find(item => item.id === action.payload);
      if (!group) {
        return;
      }
      group.selected = !group.selected;
      group.products.forEach(product => {
        product.selected = group.selected;
      });
    },
    toggleCartProductSelected(
      state,
      action: PayloadAction<{ groupId: string; productId: string }>,
    ) {
      const group = state.groups.find(item => item.id === action.payload.groupId);
      const product = group?.products.find(
        item => item.id === action.payload.productId,
      );
      if (!group || !product) {
        return;
      }
      product.selected = !product.selected;
      group.selected = group.products.every(item => item.selected);
    },
    toggleCartGroupInsurance(state, action: PayloadAction<string>) {
      const group = state.groups.find(item => item.id === action.payload);
      if (group) {
        group.insurance = !group.insurance;
      }
    },
    toggleCartGroupWoodPacking(state, action: PayloadAction<string>) {
      const group = state.groups.find(item => item.id === action.payload);
      if (group) {
        group.woodPacking = !group.woodPacking;
      }
    },
    setCartGroupNote(
      state,
      action: PayloadAction<{ groupId: string; note: string }>,
    ) {
      const group = state.groups.find(item => item.id === action.payload.groupId);
      if (group) {
        group.note = action.payload.note;
      }
    },
    updateCartProductQuantity(
      state,
      action: PayloadAction<{
        groupId: string;
        productId: string;
        quantity: number;
      }>,
    ) {
      const group = state.groups.find(item => item.id === action.payload.groupId);
      const product = group?.products.find(
        item => item.id === action.payload.productId,
      );
      if (!product) {
        return;
      }

      product.quantity = clampProductQuantity(
        action.payload.quantity,
        product.maxStock,
      );
    },
    removeCartProduct(
      state,
      action: PayloadAction<{ groupId: string; productId: string }>,
    ) {
      const group = state.groups.find(item => item.id === action.payload.groupId);
      if (!group) {
        return;
      }

      group.products = group.products.filter(
        product => product.id !== action.payload.productId,
      );
      removeEmptyCartGroups(state);
    },
    removeCartGroup(state, action: PayloadAction<string>) {
      state.groups = state.groups.filter(group => group.id !== action.payload);
    },
    addItemToCart(state, action: PayloadAction<AddToCartPayload>) {
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
      } = action.payload;

      let group = state.groups.find(item => item.supplierName === seller);

      if (!group) {
        const newGroup: CartGroup = {
          id: createCartGroupId(),
          supplierName: seller,
          selected: true,
          insurance: false,
          woodPacking: false,
          note: '',
          products: [],
        };
        state.groups.push(newGroup);
        group = newGroup;
      }

      const existingProduct = group.products.find(item => item.id === productId);
      const maxQuantity = getAddToCartMaxQuantity(action.payload);

      if (existingProduct) {
        existingProduct.quantity = clampProductQuantity(
          existingProduct.quantity + quantity,
          maxQuantity,
        );
        existingProduct.priceCny = priceCny;
        existingProduct.priceVnd = priceVnd;
        existingProduct.name = name;
        existingProduct.variant = variant;
        existingProduct.thumbnailUrl = thumbnailUrl;
        existingProduct.sku = sku;
        existingProduct.maxStock = maxStock;
        existingProduct.isOutOfStock = isOutOfStock;
        existingProduct.selected = true;
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
          selected: true,
        });
      }

      group.selected = true;
    },
    resetCartState() {
      return initialState;
    },
    hydrateCartState(state, action: PayloadAction<CartState>) {
      state.groups = action.payload.groups;
    },
  },
});

export const {
  toggleSelectAllCart,
  toggleCartGroupSelected,
  toggleCartProductSelected,
  toggleCartGroupInsurance,
  toggleCartGroupWoodPacking,
  setCartGroupNote,
  updateCartProductQuantity,
  removeCartProduct,
  removeCartGroup,
  addItemToCart,
  resetCartState,
  hydrateCartState,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
