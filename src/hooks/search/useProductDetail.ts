import { useCallback, useMemo, useState } from 'react';
import { exchangeConfig, productDetailLimits } from '@/src/configs/search';
import {
  buildProductDetailPricing,
  getProductById,
} from '@/src/helpers/search';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectSearchProducts } from '@/src/redux/search';
import type {
  ProductDetailPricing,
  SearchProduct,
} from '@/src/types/search/search.types';

export interface UseProductDetailResult {
  product: SearchProduct | undefined;
  quantity: number;
  pricing: ProductDetailPricing | undefined;
  canDecreaseQuantity: boolean;
  canIncreaseQuantity: boolean;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
}

export function useProductDetail(productId: string): UseProductDetailResult {
  const products = useAppSelector(selectSearchProducts);
  const [quantity, setQuantity] = useState(productDetailLimits.minQuantity);

  const product = useMemo(
    () => getProductById(products, productId),
    [products, productId],
  );

  const pricing = useMemo(
    () =>
      product
        ? buildProductDetailPricing(product, quantity, exchangeConfig.cnyToVnd)
        : undefined,
    [product, quantity],
  );

  const canDecreaseQuantity = quantity > productDetailLimits.minQuantity;
  const canIncreaseQuantity = quantity < productDetailLimits.maxQuantity;

  const onDecreaseQuantity = useCallback(() => {
    setQuantity(current =>
      Math.max(productDetailLimits.minQuantity, current - 1),
    );
  }, []);

  const onIncreaseQuantity = useCallback(() => {
    setQuantity(current =>
      Math.min(productDetailLimits.maxQuantity, current + 1),
    );
  }, []);

  return {
    product,
    quantity,
    pricing,
    canDecreaseQuantity,
    canIncreaseQuantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
  };
}
