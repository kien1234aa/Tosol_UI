import { useCallback, useEffect, useMemo, useState } from 'react';
import { productDetailLimits } from '@/src/configs/search';
import {
  buildProductDetailPricing,
  getProductById,
} from '@/src/helpers/search';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  fetchProductDetailThunk,
  selectIsLoadingProductDetail,
  selectProductDetail,
  selectProductDetailError,
  selectSearchProducts,
} from '@/src/redux/search';
import type {
  ProductDetailPricing,
  SearchProduct,
} from '@/src/types/search/search.types';

export interface UseProductDetailResult {
  product: SearchProduct | undefined;
  quantity: number;
  pricing: ProductDetailPricing | undefined;
  isLoading: boolean;
  error: string | null;
  canDecreaseQuantity: boolean;
  canIncreaseQuantity: boolean;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  reload: () => void;
}

export function useProductDetail(productId: string): UseProductDetailResult {
  const dispatch = useAppDispatch();
  const listProducts = useAppSelector(selectSearchProducts);
  const productDetail = useAppSelector(selectProductDetail);
  const isLoading = useAppSelector(selectIsLoadingProductDetail);
  const error = useAppSelector(selectProductDetailError);
  const [quantity, setQuantity] = useState(productDetailLimits.minQuantity);

  const reload = useCallback(() => {
    void dispatch(fetchProductDetailThunk(productId));
  }, [dispatch, productId]);

  const [prevProductId, setPrevProductId] = useState(productId);
  if (productId !== prevProductId) {
    setPrevProductId(productId);
    setQuantity(productDetailLimits.minQuantity);
  }

  useEffect(() => {
    reload();
  }, [productId, reload]);

  const product = useMemo(() => {
    if (productDetail?.id === productId) {
      return productDetail;
    }

    return getProductById(listProducts, productId);
  }, [listProducts, productDetail, productId]);

  const maxQuantity = useMemo(() => {
    if (product?.availableStock != null && product.availableStock > 0) {
      return Math.min(
        productDetailLimits.maxQuantity,
        Math.floor(product.availableStock),
      );
    }

    return productDetailLimits.maxQuantity;
  }, [product?.availableStock]);

  const pricing = useMemo(
    () => (product ? buildProductDetailPricing(product, quantity) : undefined),
    [product, quantity],
  );

  const canDecreaseQuantity = quantity > productDetailLimits.minQuantity;
  const canIncreaseQuantity = quantity < maxQuantity;

  const onDecreaseQuantity = useCallback(() => {
    setQuantity(current =>
      Math.max(productDetailLimits.minQuantity, current - 1),
    );
  }, []);

  const onIncreaseQuantity = useCallback(() => {
    setQuantity(current => Math.min(maxQuantity, current + 1));
  }, [maxQuantity]);

  return {
    product,
    quantity,
    pricing,
    isLoading,
    error,
    canDecreaseQuantity,
    canIncreaseQuantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
    reload,
  };
}
