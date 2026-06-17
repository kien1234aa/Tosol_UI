import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { productDetailCopy } from '@/src/configs/search';
import { tabBarLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import { useAddToCart } from '@/src/hooks/cart';
import { useProductDetail } from '@/src/hooks/search';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { SearchStackScreenProps } from '@/src/navigation/types';
import {
  ProductDetailActions,
  ProductDetailContent,
  ProductDetailHeader,
} from '@/src/components/search/ProductDetailView';
import { ProductDetailSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ProductDetailScreenProps = SearchStackScreenProps<'ProductDetail'>;

export function ProductDetailScreen({
  navigation,
  route,
}: ProductDetailScreenProps) {
  const { productId } = route.params;
  const {
    product,
    quantity,
    pricing,
    isLoading,
    error,
    canDecreaseQuantity,
    canIncreaseQuantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
    reload,
  } = useProductDetail(productId);
  const { addToCart } = useAddToCart();
  const insets = useSafeAreaInsets();
  const footerBottomPadding = tabBarLayout.barHeight + insets.bottom + 4;

  const handleBack = useStackGoBack(navigation, 'SearchMain');

  const handleAddToCart = useCallback(() => {
    if (!product) {
      return;
    }

    const result = addToCart(product, quantity);

    if (!result.success) {
      Alert.alert('Không thể thêm vào giỏ hàng', result.message);
      return;
    }

    Alert.alert(productDetailCopy.addedToCart, undefined, [
      {
        text: productDetailCopy.back,
        style: 'cancel',
      },
      {
        text: 'Xem giỏ hàng',
        onPress: () => navigation.getParent()?.navigate('Cart'),
      },
    ]);
  }, [addToCart, navigation, product, quantity]);

  const handleBuyNow = useCallback(() => {
    if (!product) {
      return;
    }

    const result = addToCart(product, quantity);

    if (!result.success) {
      Alert.alert('Không thể mua ngay', result.message);
      return;
    }

    navigation.getParent()?.navigate('Cart');
  }, [addToCart, navigation, product, quantity]);

  const showContent = product && pricing;
  const isOutOfStock = product?.isOutOfStock ?? false;

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProductDetailHeader onPressBack={handleBack} />

          {isLoading && !showContent ? (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}>
              <ProductDetailSkeleton style={styles.skeletonContent} />
            </ScrollView>
          ) : null}

          {!isLoading && !showContent ? (
            <Center className="flex-1 px-6">
              <VStack className="items-center" space="md">
                <Text size="md" className="text-center text-typography-500">
                  {error ?? productDetailCopy.notFound}
                </Text>
                <Pressable onPress={reload} accessibilityRole="button">
                  <Text size="sm" className="font-semibold text-tertiary-600">
                    Thử lại
                  </Text>
                </Pressable>
              </VStack>
            </Center>
          ) : null}

          {showContent ? (
            <Box style={styles.body}>
              <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled">
                <ProductDetailContent
                  product={product}
                  quantity={quantity}
                  canDecreaseQuantity={canDecreaseQuantity}
                  canIncreaseQuantity={canIncreaseQuantity}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onIncreaseQuantity={onIncreaseQuantity}
                />
              </ScrollView>

              <Box
                style={[
                  styles.footer,
                  { paddingBottom: footerBottomPadding },
                ]}>
                <ProductDetailActions
                  pricing={pricing}
                  disabled={isOutOfStock}
                  onPressAddToCart={handleAddToCart}
                  onPressBuyNow={handleBuyNow}
                />
              </Box>
            </Box>
          ) : null}
        </VStack>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  skeletonContent: {
    paddingHorizontal: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: lightTokens.background0,
    borderTopWidth: 1,
    borderTopColor: lightTokens.outline100,
  },
});
