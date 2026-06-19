import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box } from '@/src/uikits/box';
import { VStack } from '@/src/uikits/vstack';
import { animationConfig } from '@/src/configs/theme';
import { lightTokens } from '@/src/configs/theme';
import { useSearch } from '@/src/hooks/search';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import type { SearchStackScreenProps } from '@/src/navigation/types';
import type { SearchProduct } from '@/src/types/search/search.types';
import {
  ProductGridSection,
  SearchHeader,
} from '@/src/components/search';

type SearchScreenProps = SearchStackScreenProps<'SearchMain'>;

export function SearchScreen({ navigation }: SearchScreenProps) {
  const {
    query,
    warehouses,
    selectedWarehouseId,
    selectedWarehouseLabel,
    isSwitchingWarehouse,
    products,
    isLoadingProducts,
    isLoadingMoreProducts,
    productsError,
    recentQueries,
    suggestedWarehouseIds,
    setQuery,
    onSelectRecentQuery,
    onSelectWarehouse,
    loadMoreProducts,
  } = useSearch();
  const { stagger, screenEntry } = animationConfig;
  const { horizontalPadding, contentMaxWidth, isTablet } = useResponsiveLayout();

  const handleProductPress = useCallback(
    (product: SearchProduct) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation],
  );

  const handleImageSearch = useCallback(() => {
    // Image search flow is not registered yet.
  }, []);

  const listFrameStyle = {
    paddingHorizontal: horizontalPadding,
    maxWidth: isTablet ? contentMaxWidth.screen : undefined,
    alignSelf: isTablet ? ('center' as const) : undefined,
    width: isTablet ? ('100%' as const) : undefined,
  };

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <Animated.View
            entering={FadeInDown.duration(screenEntry)}
            style={styles.header}>
            <SearchHeader
              query={query}
              warehouses={warehouses}
              selectedWarehouseId={selectedWarehouseId}
              selectedWarehouseLabel={selectedWarehouseLabel}
              isSwitchingWarehouse={isSwitchingWarehouse}
              suggestedWarehouseIds={suggestedWarehouseIds}
              recentQueries={recentQueries}
              onChangeQuery={setQuery}
              onSelectRecentQuery={onSelectRecentQuery}
              onSelectWarehouse={onSelectWarehouse}
              onPressImageSearch={handleImageSearch}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger)}
            style={[styles.list, listFrameStyle]}>
            <ProductGridSection
              products={products}
              isLoading={isLoadingProducts}
              isLoadingMore={isLoadingMoreProducts}
              error={productsError}
              onPressProduct={handleProductPress}
              onEndReached={loadMoreProducts}
            />
          </Animated.View>
        </VStack>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: lightTokens.tertiary50,
    borderBottomWidth: 1,
    borderBottomColor: lightTokens.outline100,
  },
  list: {
    flex: 1,
    paddingTop: 12,
  },
});
