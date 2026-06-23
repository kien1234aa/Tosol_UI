import { useCallback, useEffect, useState } from 'react';
import { productsService } from '@/src/apis/products';
import { productsCopy } from '@/src/configs/products';
import { mapProductDetailApiToProfileDetail } from '@/src/helpers/products';
import type { ProfileProductDetail } from '@/src/types/products';

export interface UseProfileProductDetailResult {
  product: ProfileProductDetail | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isDeleting: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  deleteProduct: () => Promise<void>;
}

export function useProfileProductDetail(
  productId: string,
): UseProfileProductDetailResult {
  const [product, setProduct] = useState<ProfileProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setLoadError(null);

    try {
      const data = await productsService.getById(productId);
      setProduct(mapProductDetailApiToProfileDetail(data));
    } catch (error) {
      setProduct(null);
      setLoadError(
        error instanceof Error ? error.message : productsCopy.detailLoadError,
      );
    }
  }, [productId]);

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadProduct();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadProduct]);

  const deleteProduct = useCallback(async () => {
    setIsDeleting(true);
    try {
      await productsService.delete(productId);
    } finally {
      setIsDeleting(false);
    }
  }, [productId]);

  const [prevProductId, setPrevProductId] = useState(productId);
  if (productId !== prevProductId) {
    setPrevProductId(productId);
    setProduct(null);
    setLoadError(null);
    setIsLoading(true);
  }

  useEffect(() => {
    void loadProduct().finally(() => {
      setIsLoading(false);
    });
  }, [loadProduct]);

  return {
    product,
    isLoading,
    isRefreshing,
    isDeleting,
    loadError,
    reload,
    deleteProduct,
  };
}
