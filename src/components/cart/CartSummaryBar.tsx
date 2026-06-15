import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { cartCopy } from '@/src/configs/cart';
import { formatVndPrice } from '@/src/helpers/cart';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonFooterAction,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from '@/src/uikits/checkbox';
import { CheckIcon } from '@/src/uikits/icon';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface CartSummaryBarProps {
  grandTotalVnd: number;
  isAllSelected: boolean;
  canCreateOrders: boolean;
  onToggleSelectAll: () => void;
  onCreateOrders: () => void;
}

function CartSummaryBarComponent({
  grandTotalVnd,
  isAllSelected,
  canCreateOrders,
  onToggleSelectAll,
  onCreateOrders,
}: CartSummaryBarProps) {
  return (
    <VStack className="w-full" space="md" style={styles.container}>
      <HStack className="w-full items-center justify-between">
        <VStack space="xs">
          <Text size="sm" className="text-typography-600">
            {cartCopy.totalGoodsLabel}
          </Text>
          <Text size="xl" className="font-bold text-error-500">
            {formatVndPrice(grandTotalVnd)}
          </Text>
        </VStack>

        <Checkbox
          size="md"
          value="all"
          isChecked={isAllSelected}
          onChange={() => onToggleSelectAll()}
          aria-label={cartCopy.selectAll}>
          <CheckboxIndicator className="border-tertiary-500 data-[checked=true]:border-tertiary-500 data-[checked=true]:bg-tertiary-500">
            <CheckboxIcon as={CheckIcon} className="text-typography-0" />
          </CheckboxIndicator>
          <CheckboxLabel className="text-sm text-typography-900">
            {cartCopy.selectAll}
          </CheckboxLabel>
        </Checkbox>
      </HStack>

      <Pressable
        onPress={onCreateOrders}
        disabled={!canCreateOrders}
        accessibilityRole="button"
        accessibilityLabel={cartCopy.createOrders}
        style={[
          buttonFooterAction,
          styles.createButton,
          !canCreateOrders && styles.createButtonDisabled,
        ]}>
        <Text
          size="md"
          className="font-semibold text-typography-0"
          style={buttonLabelStyle}>
          {cartCopy.createOrders}
        </Text>
      </Pressable>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderBottomWidth: 1,
    borderBottomColor: lightTokens.outline100,
  },
  createButton: {
    backgroundColor: lightTokens.tertiary500,
  },
  createButtonDisabled: {
    opacity: 0.45,
  },
});

export const CartSummaryBar = memo(CartSummaryBarComponent);
