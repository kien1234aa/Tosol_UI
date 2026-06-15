import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box } from '@/src/uikits/box';
import { VStack } from '@/src/uikits/vstack';
import { animationConfig } from '@/src/configs/theme';
import { mainLayout } from '@/src/configs/main';
import { useSearch } from '@/src/hooks/search';
import type { SearchStackScreenProps } from '@/src/navigation/types';
import type { SearchProduct } from '@/src/types/search/search.types';
import { SupportFab } from '@/src/components/home';
import {
  ProductGridSection,
  SearchHeader,
} from '@/src/components/search';

type SearchScreenProps = SearchStackScreenProps<'SearchMain'>;

export function SearchScreen({ navigation }: SearchScreenProps) {
  const {
    query,
    selectedPlatform,
    selectedPlatformLabel,
    products,
    setQuery,
    onSelectPlatform,
  } = useSearch();
  const { stagger, screenEntry } = animationConfig;

  const handleProductPress = useCallback(
    (product: SearchProduct) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation],
  );

  const handleImageSearch = useCallback(() => {
    // Image search flow is not registered yet.
  }, []);

  const noop = useCallback(() => {}, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <VStack className="w-full" space="xl">
            <Animated.View entering={FadeInDown.duration(screenEntry)}>
              <SearchHeader
                query={query}
                selectedPlatform={selectedPlatform}
                selectedPlatformLabel={selectedPlatformLabel}
                onChangeQuery={setQuery}
                onSelectPlatform={onSelectPlatform}
                onPressImageSearch={handleImageSearch}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(screenEntry).delay(stagger)}>
              <ProductGridSection
                products={products}
                onPressProduct={handleProductPress}
              />
            </Animated.View>
          </VStack>
        </ScrollView>

        <SupportFab onPress={noop} />
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: mainLayout.tabBarHeight + 32,
  },
});
