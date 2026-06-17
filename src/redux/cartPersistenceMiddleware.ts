import { isAnyOf, type Middleware, type MiddlewareAPI } from '@reduxjs/toolkit';
import { cartStorage } from '@/src/storage/cart.storage';
import {
  addItemToCart,
  hydrateCartState,
  removeCartGroup,
  removeCartProduct,
  resetCartState,
  setCartGroupNote,
  toggleCartGroupInsurance,
  toggleCartGroupSelected,
  toggleCartGroupWoodPacking,
  toggleCartProductSelected,
  toggleSelectAllCart,
  updateCartProductQuantity,
} from './cart/cartSlice';
import { logout } from './login/authSlice';
import { loginThunk, restoreSessionThunk } from './login/authThunks';
import type { RootState } from './rootReducer';

const cartMutationActions = isAnyOf(
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
);

async function persistCartForUser(
  userId: string,
  cart: RootState['cart'],
): Promise<void> {
  await cartStorage.save(userId, cart);
}

async function restoreCartForUser(
  userId: string,
  store: MiddlewareAPI<Middleware['dispatch'], RootState>,
): Promise<void> {
  const storedCart = await cartStorage.load(userId);

  if (storedCart) {
    store.dispatch(hydrateCartState(storedCart));
    return;
  }

  store.dispatch(resetCartState());
}

export const cartPersistenceMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const result = next(action);

    if (logout.match(action)) {
      store.dispatch(resetCartState());
      return result;
    }

    if (
      loginThunk.fulfilled.match(action) ||
      restoreSessionThunk.fulfilled.match(action)
    ) {
      const userId = action.payload.user.id;
      void restoreCartForUser(userId, store);
      return result;
    }

    if (cartMutationActions(action)) {
      const { auth, cart } = store.getState();
      const userId = auth.user?.id;

      if (auth.status === 'authenticated' && userId) {
        void persistCartForUser(userId, cart);
      }
    }

    return result;
  };
