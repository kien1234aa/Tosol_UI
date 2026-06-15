import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { cartQuantityLimits, mockCartGroups } from '@/src/configs/cart';
import { createCartGroupId } from '@/src/helpers/cart';
import type { AddToCartPayload, CartGroup } from '@/src/types/cart/cart.types';

export interface CartState {
  groups: CartGroup[];
}

const initialState: CartState = {
  groups: mockCartGroups,
};

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
      product.quantity = Math.min(
        cartQuantityLimits.max,
        Math.max(cartQuantityLimits.min, action.payload.quantity),
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
    },
    removeCartGroup(state, action: PayloadAction<string>) {
      state.groups = state.groups.filter(group => group.id !== action.payload);
    },
    addItemToCart(state, action: PayloadAction<AddToCartPayload>) {
      const { productId, name, seller, priceCny, quantity, variant } =
        action.payload;

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

      if (existingProduct) {
        existingProduct.quantity = Math.min(
          cartQuantityLimits.max,
          existingProduct.quantity + quantity,
        );
        existingProduct.priceCny = priceCny;
        existingProduct.name = name;
        existingProduct.variant = variant;
        existingProduct.selected = true;
      } else {
        group.products.push({
          id: productId,
          name,
          variant,
          priceCny,
          quantity,
          selected: true,
        });
      }

      group.selected = true;
    },
    resetCartState() {
      return initialState;
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
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
