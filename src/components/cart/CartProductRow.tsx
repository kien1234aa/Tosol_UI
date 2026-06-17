import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Minus, Package, Plus, Trash2 } from 'lucide-react-native';
import { cartQuantityLimits, cartCopy } from '@/src/configs/cart';
import {
  computeLineSubtotalVnd,
  formatCartUnitPrice,
  formatVndPrice,
  getCartProductMaxQuantity,
} from '@/src/helpers/cart';
import { lightTokens } from '@/src/configs/theme';
import type { CartProductItem } from '@/src/types/cart/cart.types';
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from '@/src/uikits/checkbox';
import { CheckIcon } from '@/src/uikits/icon';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface CartProductRowProps {
  product: CartProductItem;
  onToggleSelected: () => void;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  onRemove: () => void;
}

const ICON_SIZE = 28;
const CONTROL_ICON_SIZE = 16;

function CartProductRowComponent({
  product,
  onToggleSelected,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemove,
}: CartProductRowProps) {
  const lineTotalVnd = computeLineSubtotalVnd(product);
  const maxQuantity = getCartProductMaxQuantity(product);
  const canDecrease = product.quantity > cartQuantityLimits.min;
  const canIncrease = product.quantity < maxQuantity;

  return (
    <HStack className="w-full items-start gap-2">
      <Checkbox
        size="md"
        value={product.id}
        isChecked={product.selected}
        onChange={onToggleSelected}
        aria-label={product.name}
        className="mt-3">
        <CheckboxIndicator className="border-tertiary-500 data-[checked=true]:border-tertiary-500 data-[checked=true]:bg-tertiary-500">
          <CheckboxIcon as={CheckIcon} className="text-typography-0" />
        </CheckboxIndicator>
      </Checkbox>

      <Center style={styles.thumbnail}>
        {product.thumbnailUrl ? (
          <Image
            source={{ uri: product.thumbnailUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <Package color={lightTokens.tertiary500} size={ICON_SIZE} />
        )}
      </Center>

      <VStack className="min-w-0 flex-1" space="xs">
        <Text size="sm" className="font-medium text-typography-900" numberOfLines={2}>
          {product.name}
        </Text>
        <Text size="xs" className="text-typography-500" numberOfLines={2}>
          {product.variant}
        </Text>
        <Text size="xs" className="text-typography-600">
          {cartCopy.unitPriceLabel} {formatCartUnitPrice(product)}
        </Text>
        <Text size="sm" className="font-semibold text-tertiary-600">
          {cartCopy.lineTotalLabel}{' '}
          {product.priceVnd > 0 || product.priceCny > 0
            ? formatVndPrice(lineTotalVnd)
            : cartCopy.priceOnRequest}
        </Text>

        <HStack className="items-center justify-between">
          <HStack className="items-center" style={styles.quantityControls}>
            <Pressable
              onPress={onDecreaseQuantity}
              disabled={!canDecrease}
              accessibilityRole="button"
              accessibilityLabel={cartCopy.decreaseQuantity}
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
              accessibilityLabel={cartCopy.increaseQuantity}
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
            accessibilityLabel={cartCopy.removeProduct}
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
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
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

export const CartProductRow = memo(CartProductRowComponent);
