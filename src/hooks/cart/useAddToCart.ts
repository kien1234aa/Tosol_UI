import { useCallback } from 'react';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { addItemToCart, selectCartGroups } from '@/src/redux/cart';
import {
  buildAddToCartPayload,
  validateAddToCart,
} from '@/src/helpers/search/cart.helpers';
import type { AddToCartResult } from '@/src/types/cart/cart.types';
import type { SearchProduct } from '@/src/types/search/search.types';

export interface UseAddToCartResult {
  addToCart: (product: SearchProduct, quantity: number) => AddToCartResult;
}

export function useAddToCart(): UseAddToCartResult {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectCartGroups);

  const addToCart = useCallback(
    (product: SearchProduct, quantity: number): AddToCartResult => {
      const payload = buildAddToCartPayload(product, quantity);
      const result = validateAddToCart(groups, payload, quantity);

      if (!result.success) {
        return result;
      }

      dispatch(addItemToCart(payload));
      return { success: true };
    },
    [dispatch, groups],
  );

  return { addToCart };
}
