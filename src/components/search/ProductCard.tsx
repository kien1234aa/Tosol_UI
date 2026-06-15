import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import {
  formatCnyPrice,
  formatProductPrice,
  getProductUnitPriceVnd,
} from '@/src/helpers/search';
import { lightTokens } from '@/src/configs/theme';
import type { SearchProduct } from '@/src/types/search/search.types';

interface ProductCardProps {
  product: SearchProduct;
  onPress?: (product: SearchProduct) => void;
}

const ICON_SIZE = 32;

function ProductCardComponent({ product, onPress }: ProductCardProps) {
  const unitPriceVnd = getProductUnitPriceVnd(product);
  const showOriginalPrice =
    product.originalPriceCny != null &&
    product.originalPriceCny > product.priceCny;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className="w-full">
      <VStack className="w-full" space="sm">
        <Center style={styles.imageWrap}>
          <Package color={lightTokens.tertiary500} size={ICON_SIZE} />
        </Center>

        <Text
          size="sm"
          className="font-medium text-typography-900"
          numberOfLines={2}
          style={styles.name}>
          {product.name}
        </Text>

        <VStack space="xs">
          <Text size="md" className="font-bold text-tertiary-600">
            {formatCnyPrice(product.priceCny)}
          </Text>
          <Text size="xs" className="text-typography-500">
            ≈ {formatProductPrice(unitPriceVnd)}
          </Text>
          {showOriginalPrice ? (
            <Text
              size="xs"
              className="text-typography-500"
              style={styles.originalPrice}>
              {formatCnyPrice(product.originalPriceCny!)}
            </Text>
          ) : null}
        </VStack>
      </VStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  name: {
    minHeight: 40,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
});

export const ProductCard = memo(ProductCardComponent);
