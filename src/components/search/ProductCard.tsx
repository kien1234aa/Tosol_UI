import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { searchCopy } from '@/src/configs/search';
import {
  formatCatalogPrice,
  formatStockQuantity,
  getProductStockStatusLabel,
} from '@/src/helpers/search';
import { lightTokens } from '@/src/configs/theme';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import type { SearchProduct } from '@/src/types/search/search.types';

interface ProductCardProps {
  product: SearchProduct;
  onPress?: (product: SearchProduct) => void;
}

function ProductCardComponent({ product, onPress }: ProductCardProps) {
  const stockStatusLabel = useMemo(
    () => getProductStockStatusLabel(product),
    [product],
  );

  const stockBadgeStyle = useMemo(() => {
    if (product.isOutOfStock) {
      return styles.stockBadgeDanger;
    }

    if (product.isLowStock) {
      return styles.stockBadgeWarning;
    }

    return styles.stockBadgeSuccess;
  }, [product.isLowStock, product.isOutOfStock]);

  const showWarehouseCount =
    product.warehousesCount != null && product.warehousesCount > 0;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      className="w-full">
      <Box style={styles.card}>
        <VStack className="w-full" space="sm">
          <Box style={styles.imageWrap}>
            <ProductThumbnailImage uri={product.thumbnailUrl} />

            {stockStatusLabel ? (
              <View style={[styles.stockBadge, stockBadgeStyle]}>
                <Text size="xs" className="font-semibold text-typography-0">
                  {stockStatusLabel}
                </Text>
              </View>
            ) : null}
          </Box>

          <Text
            size="sm"
            className="font-medium text-typography-900"
            numberOfLines={2}
            style={styles.name}>
            {product.name}
          </Text>

          {product.sku ? (
            <Text size="xs" className="text-typography-500" numberOfLines={1}>
              {searchCopy.skuLabel}: {product.sku}
            </Text>
          ) : null}

          <HStack className="items-center justify-between gap-2">
            <Text size="xs" className="shrink text-typography-600">
              {searchCopy.stockLabel}:{' '}
              {formatStockQuantity(product.availableStock ?? 0)}
            </Text>
            {showWarehouseCount ? (
              <Text size="xs" className="text-typography-500">
                {product.warehousesCount} {searchCopy.warehouseCountLabel}
              </Text>
            ) : null}
          </HStack>

          <Text size="md" className="font-bold text-tertiary-600">
            {formatCatalogPrice(product.priceVnd)}
          </Text>
        </VStack>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 10,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    ...productThumbnailContainerStyle,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockBadgeSuccess: {
    backgroundColor: lightTokens.tertiary600,
  },
  stockBadgeWarning: {
    backgroundColor: 'rgb(217, 119, 6)',
  },
  stockBadgeDanger: {
    backgroundColor: lightTokens.error500,
  },
  name: {
    minHeight: 36,
  },
});

export const ProductCard = memo(ProductCardComponent);
