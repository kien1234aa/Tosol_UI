import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { draftCopy, draftQuantityLimits } from '@/src/configs/createOrder';
import {
  computeLineSubtotalVnd,
  formatDraftUnitPrice,
  formatVndPrice,
  getDraftProductMaxQuantity,
} from '@/src/helpers/createOrder';
import { lightTokens } from '@/src/configs/theme';
import type { DraftProductItem } from '@/src/types/createOrderDraft/createOrderDraft.types';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface DraftProductRowProps {
  product: DraftProductItem;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onRemove: () => void;
}

const CONTROL_ICON_SIZE = 16;

function DraftProductRowComponent({
  product,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemove,
}: DraftProductRowProps) {
  const lineTotalVnd = computeLineSubtotalVnd(product);
  const maxQuantity = getDraftProductMaxQuantity(product);
  const canDecrease = product.quantity > draftQuantityLimits.min;
  const canIncrease = product.quantity < maxQuantity;

  return (
    <HStack className="w-full items-start gap-2">
      <Box style={styles.thumbnail}>
        <ProductThumbnailImage uri={product.thumbnailUrl} />
      </Box>

      <VStack className="min-w-0 flex-1" space="xs">
        <Text size="sm" className="font-medium text-typography-900" numberOfLines={2}>
          {product.name}
        </Text>
        <Text size="xs" className="text-typography-500" numberOfLines={2}>
          {product.variant}
        </Text>
        <Text size="xs" className="text-typography-600">
          {draftCopy.unitPriceLabel} {formatDraftUnitPrice(product)}
        </Text>
        <Text size="sm" className="font-semibold text-tertiary-600">
          {draftCopy.lineTotalLabel}{' '}
          {product.priceVnd > 0 || product.priceCny > 0
            ? formatVndPrice(lineTotalVnd)
            : draftCopy.priceOnRequest}
        </Text>

        <HStack className="items-center justify-between">
          <HStack className="items-center" style={styles.quantityControls}>
            <Pressable
              onPress={onDecreaseQuantity}
              disabled={!canDecrease}
              accessibilityRole="button"
              accessibilityLabel={draftCopy.decreaseQuantity}
              style={[styles.quantityButton, !canDecrease && styles.quantityButtonDisabled]}>
              <Minus
                color={
                  canDecrease
                    ? lightTokens.tertiary600
                    : lightTokens.typography500
                }
                size={CONTROL_ICON_SIZE}
              />
            </Pressable>
            <Center style={styles.quantityValue}>
              <Text size="sm" className="font-semibold text-typography-900">
                {product.quantity}
              </Text>
            </Center>
            <Pressable
              onPress={onIncreaseQuantity}
              disabled={!canIncrease}
              accessibilityRole="button"
              accessibilityLabel={draftCopy.increaseQuantity}
              style={[styles.quantityButton, !canIncrease && styles.quantityButtonDisabled]}>
              <Plus
                color={
                  canIncrease
                    ? lightTokens.tertiary600
                    : lightTokens.typography500
                }
                size={CONTROL_ICON_SIZE}
              />
            </Pressable>
          </HStack>

          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={draftCopy.removeProduct}
            style={styles.removeButton}>
            <Trash2 color={lightTokens.error500} size={18} />
          </Pressable>
        </HStack>
      </VStack>
    </HStack>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    ...productThumbnailContainerStyle,
  },
  quantityControls: {
    gap: 6,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary200,
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityValue: {
    minWidth: 36,
    height: 30,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: lightTokens.background100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const DraftProductRow = memo(DraftProductRowComponent);
