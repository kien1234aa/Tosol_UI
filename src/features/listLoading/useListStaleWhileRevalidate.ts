import { useMemo } from 'react';

export type ListStaleWhileRevalidateOptions = {
  /** false khi có lỗi và chưa có data — không skeleton che error. */
  canShowSkeleton?: boolean;
};

/**
 * MoMo-style: có cache → hiện list ngay; chỉ skeleton lần đầu chưa có item.
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
    const showInitialSkeleton =
      canShowSkeleton && loading && !hasCachedList;
    const isBackgroundRefreshing = loading && hasCachedList;
    return { showInitialSkeleton, isBackgroundRefreshing, hasCachedList };
  }, [loading, itemCount, canShowSkeleton]);
}
