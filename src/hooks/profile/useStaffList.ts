import { useCallback, useEffect, useRef, useState } from 'react';
import { usersService } from '@/src/apis/users';
import { staffCopy } from '@/src/configs/profile';
import { mapStaffApiItemsToListItems } from '@/src/helpers/profile/staff.helpers';
import type { StaffListItem } from '@/src/types/profile/staff.types';

export interface UseStaffListResult {
  staff: StaffListItem[];
  total: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  loadError: string | null;
  hasMore: boolean;
  reload: () => Promise<void>;
  loadMore: () => void;
}

export function useStaffList(enabled: boolean): UseStaffListResult {
  const [staff, setStaff] = useState<StaffListItem[]>([]);
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
      const currentRequestId = ++requestId.current;

      try {
        const { data, meta } = await usersService.listStaff({ page });

        if (currentRequestId !== requestId.current) {
          return;
        }

        const mapped = mapStaffApiItemsToListItems(data);
        setStaff(current => (append ? [...current, ...mapped] : mapped));
        setCurrentPage(meta.current_page);
        setLastPage(meta.last_page);
        setTotal(meta.total);
        setLoadError(null);
      } catch (error) {
        if (currentRequestId !== requestId.current) {
          return;
        }

        if (!append) {
          setStaff([]);
        }

        setLoadError(
          error instanceof Error ? error.message : staffCopy.loadError,
        );
      }
    },
    [],
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
    if (isLoading || isRefreshing || isLoadingMore || currentPage >= lastPage) {
      return;
    }

    setIsLoadingMore(true);
    void fetchPage(currentPage + 1, true).finally(() => {
      setIsLoadingMore(false);
    });
  }, [currentPage, fetchPage, isLoading, isLoadingMore, isRefreshing, lastPage]);

  const [prevEnabled, setPrevEnabled] = useState(enabled);
  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    if (!enabled) {
      requestId.current += 1;
      setStaff([]);
      setTotal(0);
      setCurrentPage(0);
      setLastPage(1);
      setLoadError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    } else {
      setIsLoading(true);
    }
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
    staff,
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
