import React, { memo, useCallback, useMemo } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { searchCopy } from '@/src/configs/search';
import { productsCopy } from '@/src/configs/products';
import {
  formatCatalogPrice,
  formatStockQuantity,
} from '@/src/helpers/search';
import { lightTokens } from '@/src/configs/theme';
import type { ProductListItem } from '@/src/types/products';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ProductListCardProps {
  product: ProductListItem;
  onPress?: (productId: number) => void;
  onEdit?: (productId: number) => void;
  onDelete?: (productId: number) => void;
  actionsDisabled?: boolean;
}

function ProductListCardComponent({
  product,
  onPress,
  onEdit,
  onDelete,
  actionsDisabled = false,
}: ProductListCardProps) {
  const stockLabel = useMemo(() => {
    if (product.isOutOfStock) {
      return searchCopy.outOfStockLabel;
    }

    if (product.isLowStock) {
      return searchCopy.lowStockLabel;
    }

    if (product.isInStock) {
      return searchCopy.inStockLabel;
    }

    return null;
  }, [product]);

  const stockBadgeStyle = useMemo(() => {
    if (product.isOutOfStock) {
      return styles.stockBadgeDanger;
    }

    if (product.isLowStock) {
      return styles.stockBadgeWarning;
    }

    return styles.stockBadgeSuccess;
  }, [product.isLowStock, product.isOutOfStock]);

  const handlePress = useCallback(() => {
    onPress?.(product.id);
  }, [onPress, product.id]);

  const handleEdit = useCallback(() => {
    onEdit?.(product.id);
  }, [onEdit, product.id]);

  const handleDelete = useCallback(() => {
    onDelete?.(product.id);
  }, [onDelete, product.id]);

  const showActions = onEdit != null || onDelete != null;

  return (
    <Box style={styles.card}>
      <RNPressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={product.name}
        disabled={!onPress}
        style={styles.bodyPressable}>
        <HStack className="items-start gap-3">
          <Box style={styles.thumbnailWrap}>
            <ProductThumbnailImage uri={product.thumbnailUrl} />
          </Box>

          <VStack className="min-w-0 flex-1" space="xs">
            <HStack className="items-start justify-between gap-2">
              <Text
                size="sm"
                className="flex-1 font-semibold text-typography-900"
                numberOfLines={2}>
                {product.name}
              </Text>
              <Box
                style={[
                  styles.statusBadge,
                  product.isActive ? styles.activeBadge : styles.inactiveBadge,
                ]}>
                <Text
                  size="2xs"
                  style={{
                    fontWeight: '500',
                    color: product.isActive
                      ? 'rgb(21, 128, 61)'
                      : lightTokens.typography500,
                  }}>
                  {product.isActive ? productsCopy.active : productsCopy.inactive}
                </Text>
              </Box>
            </HStack>

            <Text size="xs" className="text-typography-500" numberOfLines={1}>
              {searchCopy.skuLabel}: {product.sku}
            </Text>

            <HStack className="items-center justify-between gap-2">
              <Text size="sm" className="font-semibold text-tertiary-600">
                {formatCatalogPrice(product.priceVnd)}
              </Text>
              {stockLabel ? (
                <Box style={[styles.stockBadge, stockBadgeStyle]}>
                  <Text size="2xs" className="font-semibold text-typography-0">
                    {stockLabel}
                  </Text>
                </Box>
              ) : null}
            </HStack>

            <Text size="xs" className="text-typography-500">
              {searchCopy.stockLabel}: {formatStockQuantity(product.availableStock)}{' '}
              {product.unitLabel}
            </Text>
          </VStack>
        </HStack>
      </RNPressable>

      {showActions ? (
        <HStack style={styles.footer}>
          {onEdit ? (
            <RNPressable
              onPress={handleEdit}
              disabled={actionsDisabled}
              accessibilityRole="button"
              accessibilityLabel={productsCopy.listEditAction}
              style={[
                styles.actionButton,
                styles.editButton,
                actionsDisabled ? styles.actionDisabled : undefined,
              ]}>
              <HStack className="items-center gap-1.5">
                <Pencil color={lightTokens.tertiary600} size={16} />
                <Text size="sm" className="font-medium text-tertiary-600">
                  {productsCopy.listEditAction}
                </Text>
              </HStack>
            </RNPressable>
          ) : null}

          {onDelete ? (
            <RNPressable
              onPress={handleDelete}
              disabled={actionsDisabled}
              accessibilityRole="button"
              accessibilityLabel={productsCopy.listDeleteAction}
              style={[
                styles.actionButton,
                styles.deleteButton,
                actionsDisabled ? styles.actionDisabled : undefined,
              ]}>
              <HStack className="items-center gap-1.5">
                <Trash2 color={lightTokens.error500} size={16} />
                <Text size="sm" className="font-medium text-error-500">
                  {productsCopy.listDeleteAction}
                </Text>
              </HStack>
            </RNPressable>
          ) : null}
        </HStack>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  thumbnailWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    ...productThumbnailContainerStyle,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: 'rgb(220, 252, 231)',
  },
  inactiveBadge: {
    backgroundColor: lightTokens.background50,
  },
  stockBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  bodyPressable: {
    flex: 1,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: lightTokens.outline100,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  editButton: {
    borderColor: lightTokens.outline100,
    backgroundColor: lightTokens.tertiary50,
  },
  deleteButton: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(254, 226, 226, 0.5)',
  },
  actionDisabled: {
    opacity: 0.5,
  },
});

export const ProductListCard = memo(ProductListCardComponent);
