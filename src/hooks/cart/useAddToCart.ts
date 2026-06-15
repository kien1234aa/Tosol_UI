import { useCallback } from 'react';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { addItemToCart } from '@/src/redux/cart';
import { buildAddToCartPayload } from '@/src/helpers/search/cart.helpers';
import type { SearchProduct } from '@/src/types/search/search.types';

export interface UseAddToCartResult {
  addToCart: (product: SearchProduct, quantity: number) => void;
}

export function useAddToCart(): UseAddToCartResult {
  const dispatch = useAppDispatch();

  const addToCart = useCallback(
    (product: SearchProduct, quantity: number) => {
      dispatch(addItemToCart(buildAddToCartPayload(product, quantity)));
    },
    [dispatch],
  );

  return { addToCart };
}
