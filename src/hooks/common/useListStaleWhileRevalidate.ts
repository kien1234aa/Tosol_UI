import { useMemo } from 'react';

export type ListStaleWhileRevalidateOptions = {
  /** false when there is an error and no data — do not show skeleton over error. */
  canShowSkeleton?: boolean;
};

/**
 * Stale-while-revalidate: show cached list immediately; skeleton only on first load with no items.
 */
export function useListStaleWhileRevalidate(
  loading: boolean,
  itemCount: number,
  options?: ListStaleWhileRevalidateOptions,
): {
  showInitialSkeleton: boolean;
  isBackgroundRefreshing: boolean;
  hasCachedList: boolean;
} {
  const canShowSkeleton = options?.canShowSkeleton ?? true;

  return useMemo(() => {
    const hasCachedList = itemCount > 0;
    const showInitialSkeleton = canShowSkeleton && loading && !hasCachedList;
    const isBackgroundRefreshing = loading && hasCachedList;

    return { showInitialSkeleton, isBackgroundRefreshing, hasCachedList };
  }, [loading, itemCount, canShowSkeleton]);
}
