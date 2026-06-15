import { useCallback, useMemo } from 'react';
import { searchPlatforms } from '@/src/configs/search';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  selectFilteredSearchProducts,
  selectSearchPlatform,
  selectSearchQuery,
  setSearchPlatform,
  setSearchQuery,
} from '@/src/redux/search';
import type {
  SearchPlatformKey,
  SearchProduct,
} from '@/src/types/search/search.types';

export interface UseSearchResult {
  query: string;
  selectedPlatform: SearchPlatformKey;
  selectedPlatformLabel: string;
  products: SearchProduct[];
  setQuery: (value: string) => void;
  onSelectPlatform: (key: SearchPlatformKey) => void;
}

export function useSearch(): UseSearchResult {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectSearchQuery);
  const selectedPlatform = useAppSelector(selectSearchPlatform);
  const products = useAppSelector(selectFilteredSearchProducts);

  const selectedPlatformLabel = useMemo(
    () =>
      searchPlatforms.find(platform => platform.key === selectedPlatform)
        ?.label ?? searchPlatforms[0].label,
    [selectedPlatform],
  );

  const setQuery = useCallback(
    (value: string) => {
      dispatch(setSearchQuery(value));
    },
    [dispatch],
  );

  const onSelectPlatform = useCallback(
    (key: SearchPlatformKey) => {
      dispatch(setSearchPlatform(key));
    },
    [dispatch],
  );

  return {
    query,
    selectedPlatform,
    selectedPlatformLabel,
    products,
    setQuery,
    onSelectPlatform,
  };
}
