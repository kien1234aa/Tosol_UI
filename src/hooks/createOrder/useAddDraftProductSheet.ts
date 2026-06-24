import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { productsService } from '@/src/apis/products';
import { draftCopy } from '@/src/configs/createOrder/draft.constants';
import {
  preferenceKeys,
  searchQueryPreferenceMinLength,
} from '@/src/configs/preferences/preferences.constants';
import { productsCopy } from '@/src/configs/products';
import {
  buildAddDraftProductPayloadFromSuggestion,
  suggestionToSearchProduct,
  type DraftProductSuggestionListItem,
  type StagedDraftProduct,
  validateStagedDraftProducts,
} from '@/src/helpers/createOrder/draftProductSuggestion.helpers';
import { getAddDraftMaxQuantity, findDraftProductQuantity } from '@/src/helpers/createOrder/draftProduct.helpers';
import { buildSearchProductPreferenceRecord } from '@/src/helpers/preferences/productPreference.helpers';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  addDraftProduct,
  makeSelectDraftGroups,
} from '@/src/redux/createOrderDraft';
import { recordPreference } from '@/src/redux/preferences';
import type { ProductSuggestionItem } from '@/src/types/products';

const suggestDebounceMs = 300;
const searchQueryRecordDebounceMs = 1000;

export interface UseAddDraftProductSheetOptions {
  visible: boolean;
  draftId: string;
  sellerName: string;
  warehouseId: number | null;
  onClose: () => void;
}

export interface UseAddDraftProductSheetResult {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  suggestions: DraftProductSuggestionListItem[];
  stagedItems: StagedDraftProduct[];
  isLoading: boolean;
  loadError: string | null;
  canComplete: boolean;
  onSelectSuggestion: (item: ProductSuggestionItem) => void;
  onIncreaseStagedQuantity: (productId: string) => void;
  onDecreaseStagedQuantity: (productId: string) => void;
  onRemoveStagedItem: (productId: string) => void;
  onCancel: () => void;
  onComplete: () => void;
}

function resetSheetState(): {
  searchQuery: string;
  suggestions: ProductSuggestionItem[];
  stagedItems: StagedDraftProduct[];
  loadError: string | null;
  isLoading: boolean;
} {
  return {
    searchQuery: '',
    suggestions: [],
    stagedItems: [],
    loadError: null,
    isLoading: false,
  };
}

export function useAddDraftProductSheet({
  visible,
  draftId,
  sellerName,
  warehouseId,
  onClose,
}: UseAddDraftProductSheetOptions): UseAddDraftProductSheetResult {
  const dispatch = useAppDispatch();
  const selectDraftGroups = useMemo(
    () => makeSelectDraftGroups(draftId),
    [draftId],
  );
  const groups = useAppSelector(selectDraftGroups);

  const [searchQuery, setSearchQuery] = useState('');
  const [apiSuggestions, setApiSuggestions] = useState<ProductSuggestionItem[]>(
    [],
  );
  const [stagedItems, setStagedItems] = useState<StagedDraftProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const searchQueryRecordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const stagedProductIds = useMemo(
    () => new Set(stagedItems.map(item => item.productId)),
    [stagedItems],
  );

  const suggestions = useMemo(
    () =>
      apiSuggestions
        .filter(item => !stagedProductIds.has(String(item.id)))
        .map(
          (suggestion): DraftProductSuggestionListItem => ({
            suggestion,
            isPreferred: false,
          }),
        ),
    [apiSuggestions, stagedProductIds],
  );

  const fetchSuggestions = useCallback(
    async (search: string) => {
      if (warehouseId == null) {
        setApiSuggestions([]);
        setLoadError(draftCopy.addProductSheetContextRequired);
        setIsLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const currentRequestId = ++requestId.current;

      setIsLoading(true);
      setLoadError(null);

      try {
        const items = await productsService.suggestions({
          warehouseId,
          search,
          excludeCombos: false,
          signal: controller.signal,
        });

        if (currentRequestId !== requestId.current) {
          return;
        }

        setApiSuggestions(items);
      } catch (error) {
        if (controller.signal.aborted || currentRequestId !== requestId.current) {
          return;
        }

        setApiSuggestions([]);
        setLoadError(
          error instanceof Error ? error.message : productsCopy.loadError,
        );
      } finally {
        if (currentRequestId === requestId.current) {
          setIsLoading(false);
        }
      }
    },
    [warehouseId],
  );

  useEffect(() => {
    if (!visible) {
      abortRef.current?.abort();
      if (searchQueryRecordTimeoutRef.current) {
        clearTimeout(searchQueryRecordTimeoutRef.current);
        searchQueryRecordTimeoutRef.current = null;
      }
      const reset = resetSheetState();
      setSearchQuery(reset.searchQuery);
      setApiSuggestions(reset.suggestions);
      setStagedItems(reset.stagedItems);
      setLoadError(reset.loadError);
      setIsLoading(reset.isLoading);
      return;
    }

    const delay = searchQuery.trim() ? suggestDebounceMs : 0;
    const timer = setTimeout(() => {
      void fetchSuggestions(searchQuery);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchSuggestions, searchQuery, visible]);

  const onChangeSearchQuery = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (searchQueryRecordTimeoutRef.current) {
        clearTimeout(searchQueryRecordTimeoutRef.current);
      }

      const trimmed = value.trim();
      if (trimmed.length >= searchQueryPreferenceMinLength) {
        searchQueryRecordTimeoutRef.current = setTimeout(() => {
          dispatch(
            recordPreference({
              key: preferenceKeys.searchQuery,
              id: trimmed.toLowerCase(),
              label: trimmed,
            }),
          );
        }, searchQueryRecordDebounceMs);
      }
    },
    [dispatch],
  );

  const getNextAllowedQuantity = useCallback(
    (item: ProductSuggestionItem, currentStagingQuantity: number, delta: number) => {
      const payload = buildAddDraftProductPayloadFromSuggestion(item, 1, sellerName);
      const maxQuantity = getAddDraftMaxQuantity(payload);
      const inDraft = findDraftProductQuantity(groups, String(item.id));
      const nextQuantity = currentStagingQuantity + delta;
      const totalQuantity = inDraft + nextQuantity;

      if (nextQuantity < 1) {
        return 0;
      }

      if (totalQuantity > maxQuantity) {
        return currentStagingQuantity;
      }

      return nextQuantity;
    },
    [groups, sellerName],
  );

  const onSelectSuggestion = useCallback(
    (item: ProductSuggestionItem) => {
      const productId = String(item.id);
      const payload = buildAddDraftProductPayloadFromSuggestion(
        item,
        1,
        sellerName,
      );

      if (payload.isOutOfStock) {
        Alert.alert(
          draftCopy.addProductSheetCommitError,
          draftCopy.outOfStockError,
        );
        return;
      }

      setStagedItems(current => {
        const existing = current.find(entry => entry.productId === productId);
        const currentQuantity = existing?.quantity ?? 0;
        const nextQuantity = getNextAllowedQuantity(item, currentQuantity, 1);

        if (nextQuantity <= 0 || nextQuantity === currentQuantity) {
          if (!existing && nextQuantity <= 0) {
            Alert.alert(
              draftCopy.addProductSheetCommitError,
              draftCopy.exceedsStock.replace(
                '{max}',
                String(getAddDraftMaxQuantity(payload)),
              ),
            );
          }
          return current;
        }

        if (existing) {
          return current.map(entry =>
            entry.productId === productId
              ? { ...entry, quantity: nextQuantity }
              : entry,
          );
        }

        return [
          ...current,
          {
            productId,
            suggestion: item,
            quantity: nextQuantity,
          },
        ];
      });
    },
    [getNextAllowedQuantity, sellerName],
  );

  const updateStagedQuantity = useCallback(
    (productId: string, delta: number) => {
      setStagedItems(current => {
        const target = current.find(item => item.productId === productId);
        if (!target) {
          return current;
        }

        const nextQuantity = getNextAllowedQuantity(
          target.suggestion,
          target.quantity,
          delta,
        );

        if (nextQuantity <= 0) {
          return current.filter(item => item.productId !== productId);
        }

        if (nextQuantity === target.quantity) {
          return current;
        }

        return current.map(item =>
          item.productId === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        );
      });
    },
    [getNextAllowedQuantity],
  );

  const onIncreaseStagedQuantity = useCallback(
    (productId: string) => {
      updateStagedQuantity(productId, 1);
    },
    [updateStagedQuantity],
  );

  const onDecreaseStagedQuantity = useCallback(
    (productId: string) => {
      updateStagedQuantity(productId, -1);
    },
    [updateStagedQuantity],
  );

  const onRemoveStagedItem = useCallback((productId: string) => {
    setStagedItems(current =>
      current.filter(item => item.productId !== productId),
    );
  }, []);

  const onCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const onComplete = useCallback(() => {
    if (stagedItems.length === 0) {
      return;
    }

    const validation = validateStagedDraftProducts(
      groups,
      stagedItems,
      sellerName,
    );

    if (!validation.success) {
      Alert.alert(
        draftCopy.addProductSheetCommitError,
        validation.message ?? draftCopy.outOfStockError,
      );
      return;
    }

    for (const staged of stagedItems) {
      const payload = buildAddDraftProductPayloadFromSuggestion(
        staged.suggestion,
        staged.quantity,
        sellerName,
      );
      dispatch(addDraftProduct({ draftId, payload }));
      dispatch(
        recordPreference(
          buildSearchProductPreferenceRecord(
            suggestionToSearchProduct(staged.suggestion, sellerName),
          ),
        ),
      );
    }

    onClose();
  }, [dispatch, draftId, groups, onClose, sellerName, stagedItems]);

  return {
    searchQuery,
    onChangeSearchQuery,
    suggestions,
    stagedItems,
    isLoading,
    loadError,
    canComplete: stagedItems.length > 0,
    onSelectSuggestion,
    onIncreaseStagedQuantity,
    onDecreaseStagedQuantity,
    onRemoveStagedItem,
    onCancel,
    onComplete,
  };
}
