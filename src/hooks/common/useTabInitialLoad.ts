import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

type UseTabInitialLoadArgs = {
  /** True when Redux already holds a usable list for the current key. */
  hasCache: boolean;
  /** True when the last fetch failed and user re-enters the tab. */
  hasError: boolean;
  load: () => void;
  /** When this value changes (filters, warehouse, …), reload even if cache exists. */
  reloadKey?: string;
};

/**
 * MoMo-style tab data: fetch on first focus, keep Redux cache on later visits.
 * Changing `reloadKey` always triggers a fresh load.
 */
export function useTabInitialLoad({
  hasCache,
  hasError,
  load,
  reloadKey,
}: UseTabInitialLoadArgs): void {
  const previousReloadKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (reloadKey == null) {
      return;
    }

    if (previousReloadKey.current === reloadKey) {
      return;
    }

    const isFilterChange = previousReloadKey.current != null;
    previousReloadKey.current = reloadKey;

    if (isFilterChange) {
      load();
    }
  }, [load, reloadKey]);

  useFocusEffect(
    useCallback(() => {
      if (!hasCache || hasError) {
        load();
      }
    }, [hasCache, hasError, load]),
  );
}
