import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box } from '@/src/uikits/box';
import { VStack } from '@/src/uikits/vstack';
import { animationConfig } from '@/src/configs/theme';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
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
        <VStack className="flex-1">
          <Animated.View
            entering={FadeInDown.duration(screenEntry)}
            style={styles.header}>
            <SearchHeader
              query={query}
              selectedPlatform={selectedPlatform}
              selectedPlatformLabel={selectedPlatformLabel}
              onChangeQuery={setQuery}
              onSelectPlatform={onSelectPlatform}
              onPressImageSearch={handleImageSearch}
            />
          </Animated.View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <Animated.View
              entering={FadeInDown.duration(screenEntry).delay(stagger)}>
              <ProductGridSection
                products={products}
                onPressProduct={handleProductPress}
              />
            </Animated.View>
          </ScrollView>
        </VStack>

        <SupportFab onPress={noop} />
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPaddingLoose,
  },
});
