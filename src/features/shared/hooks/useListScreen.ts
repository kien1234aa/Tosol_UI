import { useCallback, useState } from 'react';

export interface UseListScreenOptions {
  initialPage?: number;
  pageSize?: number;
}

export function useListScreen(options: UseListScreenOptions = {}) {
  const { initialPage = 1, pageSize = 20 } = options;
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async (fetcher: () => Promise<void>) => {
    setRefreshing(true);
    try {
      await fetcher();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    page,
    pageSize,
    search,
    refreshing,
    setPage,
    setSearch,
    onRefresh,
  };
}

export function useDetailScreen() {
  const [activeTab, setActiveTab] = useState(0);
  return { activeTab, setActiveTab };
}
