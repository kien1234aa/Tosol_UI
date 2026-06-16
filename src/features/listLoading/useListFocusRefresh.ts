import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

export type ListFocusRefreshOptions = {
  /** Bỏ qua lần focus đầu (mount đã fetch). */
  skipInitialFocus?: boolean;
  /** Chỉ refetch nền khi đã có cache. */
  onlyWhenCached?: boolean;
  itemCount?: number;
};

/**
 * Refetch khi quay lại tab/màn — không xóa list (slice giữ items khi pending).
 */
export function useListFocusRefresh(
  refetch: () => void,
  options?: ListFocusRefreshOptions,
): void {
  const initialSkip = useRef(options?.skipInitialFocus ?? true);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useFocusEffect(
    useCallback(() => {
      if (initialSkip.current) {
        initialSkip.current = false;
        return;
      }
      if (options?.onlyWhenCached && (options.itemCount ?? 0) === 0) {
        return;
      }
      refetchRef.current();
    }, [options?.onlyWhenCached, options?.itemCount]),
  );
}
