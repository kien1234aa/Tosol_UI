import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productDetailCopy } from '@/src/configs/search';
import { mainLayout } from '@/src/configs/main';
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
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
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
    canDecreaseQuantity,
    canIncreaseQuantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
  } = useProductDetail(productId);
  const { addToCart } = useAddToCart();

  const handleBack = useStackGoBack(navigation, 'SearchMain');

  const handleAddToCart = useCallback(() => {
    if (!product) {
      return;
    }

    addToCart(product, quantity);

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

    addToCart(product, quantity);
    navigation.getParent()?.navigate('Cart');
  }, [addToCart, navigation, product, quantity]);

  if (!product || !pricing) {
    return (
      <Box className="flex-1 bg-background-50">
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <VStack className="flex-1">
            <ProductDetailHeader onPressBack={handleBack} />
            <Center className="flex-1">
              <Text size="md" className="text-center text-typography-500">
                {productDetailCopy.notFound}
              </Text>
            </Center>
          </VStack>
        </SafeAreaView>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProductDetailHeader onPressBack={handleBack} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <ProductDetailContent
              product={product}
              quantity={quantity}
              pricing={pricing}
              canDecreaseQuantity={canDecreaseQuantity}
              canIncreaseQuantity={canIncreaseQuantity}
              onDecreaseQuantity={onDecreaseQuantity}
              onIncreaseQuantity={onIncreaseQuantity}
            />
          </ScrollView>

          <Box style={styles.footer}>
            <ProductDetailActions
              pricing={pricing}
              onPressAddToCart={handleAddToCart}
              onPressBuyNow={handleBuyNow}
            />
          </Box>
        </VStack>
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
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
    backgroundColor: lightTokens.background0,
    borderTopWidth: 1,
    borderTopColor: lightTokens.outline100,
  },
});
