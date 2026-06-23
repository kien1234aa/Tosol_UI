import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable as RNPressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { productsService } from '@/src/apis/products';
import { productsCopy } from '@/src/configs/products';
import { lightTokens } from '@/src/configs/theme';
import type { ProductSuggestionItem } from '@/src/types/products';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export interface ComboProductPickerSheetProps {
  visible: boolean;
  sellerId: number | null;
  warehouseId: number | null;
  excludedProductIds?: number[];
  onClose: () => void;
  onSelect: (product: ProductSuggestionItem) => void;
}

function ComboProductPickerSheetComponent({
  visible,
  sellerId,
  warehouseId,
  excludedProductIds = [],
  onClose,
  onSelect,
}: ComboProductPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const excludedIds = useMemo(
    () => new Set(excludedProductIds),
    [excludedProductIds],
  );

  const visibleSuggestions = useMemo(
    () => suggestions.filter(item => !excludedIds.has(item.id)),
    [excludedIds, suggestions],
  );

  const fetchSuggestions = useCallback(
    async (search: string) => {
      if (sellerId == null) {
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
          sellerId,
          warehouseId,
          search,
          excludeCombos: true,
          signal: controller.signal,
        });

        if (currentRequestId !== requestId.current) {
          return;
        }

        setSuggestions(items);
      } catch (error) {
        if (controller.signal.aborted || currentRequestId !== requestId.current) {
          return;
        }

        setSuggestions([]);
        setLoadError(
          error instanceof Error ? error.message : productsCopy.loadError,
        );
      } finally {
        if (currentRequestId === requestId.current) {
          setIsLoading(false);
        }
      }
    },
    [sellerId, warehouseId],
  );

  useEffect(() => {
    if (!visible) {
      abortRef.current?.abort();
      setSearchQuery('');
      setSuggestions([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    const delay = searchQuery.trim() ? 300 : 0;
    const timer = setTimeout(() => {
      void fetchSuggestions(searchQuery);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchSuggestions, searchQuery, visible]);

  const handleSelect = useCallback(
    (product: ProductSuggestionItem) => {
      onSelect(product);
      onClose();
    },
    [onClose, onSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: ProductSuggestionItem }) => (
      <Pressable
        onPress={() => handleSelect(item)}
        accessibilityRole="button"
        style={styles.suggestionRow}>
        <HStack className="items-center gap-3">
          <Box style={styles.thumbnailWrap}>
            <ProductThumbnailImage uri={item.thumbnailUrl} />
          </Box>
          <VStack className="min-w-0 flex-1" space="xs">
            <Text
              size="md"
              className="font-medium text-typography-900"
              numberOfLines={3}>
              {item.name}
            </Text>
            <Text size="sm" className="text-typography-500">
              SKU: {item.sku}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
    ),
    [handleSelect],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}>
        <HStack className="items-center justify-between px-4 py-3">
          <VStack className="min-w-0 flex-1 pr-3" space="xs">
            <Text size="lg" className="font-bold text-typography-900">
              {productsCopy.comboPickerTitle}
            </Text>
            <Text size="sm" className="text-typography-500">
              {productsCopy.comboItemsHint}
            </Text>
          </VStack>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={productsCopy.comboModalClose}
            style={styles.closeButton}>
            <X color={lightTokens.typography500} size={20} />
          </Pressable>
        </HStack>

        <Box className="px-4 pb-3">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={productsCopy.comboPickerSearchPlaceholder}
            placeholderTextColor={lightTokens.typography500}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </Box>

        {isLoading ? (
          <Box style={styles.loadingBox}>
            <ActivityIndicator color={lightTokens.tertiary600} />
          </Box>
        ) : loadError ? (
          <Text size="sm" className="px-4 py-6 text-center text-error-500">
            {loadError}
          </Text>
        ) : visibleSuggestions.length === 0 ? (
          <Text size="sm" className="px-4 py-6 text-center text-typography-500">
            {productsCopy.comboPickerEmpty}
          </Text>
        ) : (
          <FlatList
            data={visibleSuggestions}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightTokens.background0,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background50,
  },
  searchInput: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    color: lightTokens.typography900,
    fontSize: 16,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  suggestionRow: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  thumbnailWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    overflow: 'hidden',
    ...productThumbnailContainerStyle,
  },
});

export const ComboProductPickerSheet = memo(ComboProductPickerSheetComponent);
