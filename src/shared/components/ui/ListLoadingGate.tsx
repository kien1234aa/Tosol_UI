import React, { type ReactNode } from 'react';
import {
  useListStaleWhileRevalidate,
  type ListStaleWhileRevalidateOptions,
} from '@/src/hooks/common/useListStaleWhileRevalidate';

export type ListLoadingGateProps = {
  loading: boolean;
  itemCount: number;
  /** Background refetch — not treated as full-screen loading. */
  refreshing?: boolean;
  options?: ListStaleWhileRevalidateOptions;
  skeleton: ReactNode;
  children: ReactNode;
};

/** Skeleton only on first load with no items; refetch uses RefreshControl on parent screen. */
export function ListLoadingGate({
  loading,
  itemCount,
  refreshing = false,
  options,
  skeleton,
  children,
}: ListLoadingGateProps) {
  const effectiveLoading = loading && !refreshing;
  const { showInitialSkeleton } = useListStaleWhileRevalidate(
    effectiveLoading,
    itemCount,
    options,
  );

  if (showInitialSkeleton) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}
