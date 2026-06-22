import React, { memo, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  type ListRenderItem,
} from 'react-native';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { mainLayout } from '@/src/configs/main';
import { searchCopy } from '@/src/configs/search';
import { lightTokens } from '@/src/configs/theme';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import type { SearchProduct } from '@/src/types/search/search.types';
import { ListLoadingGate } from '@/src/shared/components/ui/ListLoadingGate';
import { ProductGridSkeleton } from '@/src/shared/components/ui/skeleton';
import { ProductCard } from './ProductCard';

interface ProductGridSectionProps {
  products: SearchProduct[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  error?: string | null;
  onPressProduct?: (product: SearchProduct) => void;
  onEndReached?: () => void;
}

function ProductGridSectionComponent({
  products,
  isLoading = false,
  isLoadingMore = false,
  error = null,
  onPressProduct,
  onEndReached,
}: ProductGridSectionProps) {
  const { productGridColumns, gridGap } = useResponsiveLayout();

  const renderItem = useCallback<ListRenderItem<SearchProduct>>(
    ({ item }) => (
      <Box style={styles.cell}>
        <ProductCard product={item} onPress={onPressProduct} />
      </Box>
    ),
    [onPressProduct],
  );

  const keyExtractor = useCallback((item: SearchProduct) => item.id, []);

  const ListHeaderComponent = useCallback(
    () => (
      <Text size="lg" className="mb-3 font-bold text-typography-900">
        {searchCopy.productsSection}
      </Text>
    ),
    [],
  );

  const ListEmptyComponent = useCallback(() => {
    return (
      <Center className="py-8">
        <Text size="sm" className="text-center text-typography-500">
          {error ?? searchCopy.emptyResults}
        </Text>
      </Center>
    );
  }, [error]);

  const ListFooterComponent = useCallback(() => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <Center className="py-4">
        <ActivityIndicator color={lightTokens.tertiary600} />
      </Center>
    );
  }, [isLoadingMore]);

  const listSkeleton = useMemo(
    () => (
      <ProductGridSkeleton
        rowCount={4}
        columnCount={productGridColumns}
      />
    ),
    [productGridColumns],
  );

  return (
    <ListLoadingGate
      loading={isLoading}
      refreshing={isLoading && products.length > 0}
      itemCount={products.length}
      options={{ canShowSkeleton: !error }}
      skeleton={listSkeleton}>
      <FlatList
        key={`product-grid-${productGridColumns}`}
        data={products}
        style={styles.list}
        numColumns={productGridColumns}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        columnWrapperStyle={
          products.length > 0 ? [styles.row, { gap: gridGap }] : undefined
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
      />
    </ListLoadingGate>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
  row: {
    marginBottom: 12,
  },
  cell: {
    flex: 1,
  },
});

export const ProductGridSection = memo(ProductGridSectionComponent);
