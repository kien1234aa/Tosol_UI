import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { productDetailCopy } from '@/src/configs/search';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface ProductQuantitySelectorProps {
  quantity: number;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}

const ICON_SIZE = 18;
const BUTTON_SIZE = 36;

function ProductQuantitySelectorComponent({
  quantity,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
}: ProductQuantitySelectorProps) {
  return (
    <HStack className="items-center" style={styles.container}>
      <Pressable
        onPress={onDecrease}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel={productDetailCopy.decreaseQuantity}
        style={[styles.button, !canDecrease && styles.buttonDisabled]}>
        <Minus
          color={
            canDecrease ? lightTokens.tertiary600 : lightTokens.typography500
          }
          size={ICON_SIZE}
        />
      </Pressable>

      <Center style={styles.quantityValue}>
        <Text size="md" className="font-semibold text-typography-900">
          {quantity}
        </Text>
      </Center>

      <Pressable
        onPress={onIncrease}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel={productDetailCopy.increaseQuantity}
        style={[styles.button, !canIncrease && styles.buttonDisabled]}>
        <Plus
          color={
            canIncrease ? lightTokens.tertiary600 : lightTokens.typography500
          }
          size={ICON_SIZE}
        />
      </Pressable>
    </HStack>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.tertiary50,
    borderWidth: 1,
    borderColor: lightTokens.tertiary200,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  quantityValue: {
    minWidth: 40,
    height: BUTTON_SIZE,
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
});

export const ProductQuantitySelector = memo(ProductQuantitySelectorComponent);
