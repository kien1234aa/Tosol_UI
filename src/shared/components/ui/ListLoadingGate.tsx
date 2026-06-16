import React, { type ReactNode } from 'react';
import { ListScreenSkeleton } from './skeleton/ListScreenSkeleton';
import {
  useListStaleWhileRevalidate,
  type ListStaleWhileRevalidateOptions,
} from '@features/listLoading/useListStaleWhileRevalidate';

export type ListLoadingGateProps = {
  loading: boolean;
  itemCount: number;
  /** Tách refetch nền — không coi là `loading` full màn. */
  refreshing?: boolean;
  options?: ListStaleWhileRevalidateOptions;
  skeletonCount?: number;
  showSectionHeader?: boolean;
  /** false khi card không có ảnh/icon leading (thumbnail bên trái). */
  withLeading?: boolean;
  /** Truyền true khi card trong danh sách hiển thị dòng subtitleSecondary. */
  hasSubtitleSecondary?: boolean;
  /** Truyền true khi card trong danh sách hiển thị dòng detail / metaLine. */
  hasDetail?: boolean;
  children: ReactNode;
};

/** Skeleton chỉ lần đầu chưa có item; refetch dùng RefreshControl ở màn cha. */
export function ListLoadingGate({
  loading,
  itemCount,
  refreshing = false,
  options,
  skeletonCount,
  showSectionHeader,
  withLeading,
  hasSubtitleSecondary,
  hasDetail,
  children,
}: ListLoadingGateProps) {
  const effectiveLoading = loading && !refreshing;
  const { showInitialSkeleton } = useListStaleWhileRevalidate(
    effectiveLoading,
    itemCount,
    options,
  );

  if (showInitialSkeleton) {
    return (
      <ListScreenSkeleton
        count={skeletonCount}
        showSectionHeader={showSectionHeader}
        withLeading={withLeading}
        hasSubtitleSecondary={hasSubtitleSecondary}
        hasDetail={hasDetail}
      />
    );
  }

  return <>{children}</>;
}
