import { useCallback, useEffect, useRef, useState } from 'react';
import { productsService } from '@/src/apis/products';
import { productsCopy, productsPageSize } from '@/src/configs/products';
import { mapProductApiItemToListItem } from '@/src/helpers/products';
import type { ProductListItem } from '@/src/types/products';

export interface UseProductListResult {
  products: ProductListItem[];
  total: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  loadError: string | null;
  hasMore: boolean;
  reload: () => Promise<void>;
  loadMore: () => void;
}

export function useProductList(sellerId: number | null): UseProductListResult {
  const enabled = sellerId != null;
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (sellerId == null) {
        return;
      }

      const currentRequestId = ++requestId.current;

      try {
        const { products: items, meta } = await productsService.list({
          page,
          perPage: productsPageSize,
          sellerId,
        });

        if (currentRequestId !== requestId.current) {
          return;
        }

        const mapped = items.map(mapProductApiItemToListItem);
        setProducts(current => (append ? [...current, ...mapped] : mapped));
        setCurrentPage(meta.current_page);
        setLastPage(meta.last_page);
        setTotal(meta.total);
        setLoadError(null);
      } catch (error) {
        if (currentRequestId !== requestId.current) {
          return;
        }

        if (!append) {
          setProducts([]);
        }

        setLoadError(
          error instanceof Error ? error.message : productsCopy.loadError,
        );
      }
    },
    [sellerId],
  );

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchPage(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
      isLoading ||
      isRefreshing ||
      isLoadingMore ||
      currentPage >= lastPage
    ) {
      return;
    }

    setIsLoadingMore(true);
    void fetchPage(currentPage + 1, true).finally(() => {
      setIsLoadingMore(false);
    });
  }, [
    currentPage,
    enabled,
    fetchPage,
    isLoading,
    isLoadingMore,
    isRefreshing,
    lastPage,
  ]);

  const [prevSellerId, setPrevSellerId] = useState(sellerId);
  if (sellerId !== prevSellerId) {
    setPrevSellerId(sellerId);
    requestId.current += 1;
    setProducts([]);
    setTotal(0);
    setCurrentPage(0);
    setLastPage(1);
    setLoadError(null);
    setIsRefreshing(false);
    setIsLoadingMore(false);
    setIsLoading(sellerId != null);
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchPage(1, false).finally(() => {
      setIsLoading(false);
    });
  }, [enabled, fetchPage]);

  return {
    products,
    total,
    isLoading,
    isRefreshing,
    isLoadingMore,
    loadError,
    hasMore: currentPage < lastPage,
    reload,
    loadMore,
  };
}
