import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { cartCopy } from '@/src/configs/cart';
import { formatVndPrice } from '@/src/helpers/cart';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonFlex,
  buttonFooterAction,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import type { CartGroupViewModel } from '@/src/types/cart/cart.types';
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from '@/src/uikits/checkbox';
import { CheckIcon } from '@/src/uikits/icon';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Input, InputField } from '@/src/uikits/input';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { CartProductRow } from './CartProductRow';

interface CartGroupCardProps {
  group: CartGroupViewModel;
  onToggleGroup: (groupId: string) => void;
  onToggleProduct: (groupId: string, productId: string) => void;
  onToggleInsurance: (groupId: string) => void;
  onToggleWoodPacking: (groupId: string) => void;
  onChangeNote: (groupId: string, note: string) => void;
  onIncreaseQuantity: (groupId: string, productId: string) => void;
  onDecreaseQuantity: (groupId: string, productId: string) => void;
  onRemoveProduct: (groupId: string, productId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onCreateGroupOrder: (groupId: string) => void;
}

function CartGroupCardComponent({
  group,
  onToggleGroup,
  onToggleProduct,
  onToggleInsurance,
  onToggleWoodPacking,
  onChangeNote,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveProduct,
  onRemoveGroup,
  onCreateGroupOrder,
}: CartGroupCardProps) {
  const handleToggleGroup = useCallback(() => {
    onToggleGroup(group.id);
  }, [group.id, onToggleGroup]);

  const handleToggleInsurance = useCallback(() => {
    onToggleInsurance(group.id);
  }, [group.id, onToggleInsurance]);

  const handleToggleWoodPacking = useCallback(() => {
    onToggleWoodPacking(group.id);
  }, [group.id, onToggleWoodPacking]);

  const handleNoteChange = useCallback(
    (value: string) => {
      onChangeNote(group.id, value);
    },
    [group.id, onChangeNote],
  );

  const handleRemoveGroup = useCallback(() => {
    onRemoveGroup(group.id);
  }, [group.id, onRemoveGroup]);

  const handleCreateGroupOrder = useCallback(() => {
    onCreateGroupOrder(group.id);
  }, [group.id, onCreateGroupOrder]);

  return (
    <Box style={styles.card}>
      <VStack space="md">
        <Checkbox
          size="md"
          value={group.id}
          isChecked={group.selected}
          onChange={handleToggleGroup}
          aria-label={`${cartCopy.supplierPrefix} ${group.supplierName}`}>
          <CheckboxIndicator className="border-tertiary-500 data-[checked=true]:border-tertiary-500 data-[checked=true]:bg-tertiary-500">
            <CheckboxIcon as={CheckIcon} className="text-typography-0" />
          </CheckboxIndicator>
          <CheckboxLabel className="flex-1 text-sm font-semibold text-typography-900">
            {cartCopy.supplierPrefix} {group.supplierName}
          </CheckboxLabel>
        </Checkbox>

        <HStack className="flex-wrap gap-4">
          <Checkbox
            size="md"
            value={`${group.id}-insurance`}
            isChecked={group.insurance}
            onChange={handleToggleInsurance}
            aria-label={cartCopy.insurance}>
            <CheckboxIndicator className="border-tertiary-500 data-[checked=true]:border-tertiary-500 data-[checked=true]:bg-tertiary-500">
              <CheckboxIcon as={CheckIcon} className="text-typography-0" />
            </CheckboxIndicator>
            <CheckboxLabel className="text-sm text-typography-900">
              {cartCopy.insurance}
            </CheckboxLabel>
          </Checkbox>

          <Checkbox
            size="md"
            value={`${group.id}-wood`}
            isChecked={group.woodPacking}
            onChange={handleToggleWoodPacking}
            aria-label={cartCopy.woodPacking}>
            <CheckboxIndicator className="border-tertiary-500 data-[checked=true]:border-tertiary-500 data-[checked=true]:bg-tertiary-500">
              <CheckboxIcon as={CheckIcon} className="text-typography-0" />
            </CheckboxIndicator>
            <CheckboxLabel className="text-sm text-typography-900">
              {cartCopy.woodPacking}
            </CheckboxLabel>
          </Checkbox>
        </HStack>

        <VStack space="md">
          {group.products.map(product => (
            <CartProductRow
              key={product.id}
              product={product}
              onToggleSelected={() => onToggleProduct(group.id, product.id)}
              onDecreaseQuantity={() =>
                onDecreaseQuantity(group.id, product.id)
              }
              onIncreaseQuantity={() =>
                onIncreaseQuantity(group.id, product.id)
              }
              onRemove={() => onRemoveProduct(group.id, product.id)}
            />
          ))}
        </VStack>

        <VStack space="sm" style={styles.costRows}>
          <HStack className="justify-between">
            <Text size="sm" className="text-typography-600">
              {cartCopy.goodsAmount}
            </Text>
            <Text size="sm" className="font-medium text-typography-900">
              {formatVndPrice(group.costs.goodsVnd)}
            </Text>
          </HStack>
          <HStack className="justify-between">
            <Text size="sm" className="text-typography-600">
              {cartCopy.estimatedFee}
            </Text>
            <Text size="sm" className="font-medium text-typography-900">
              {formatVndPrice(group.costs.estimatedFeeVnd)}
            </Text>
          </HStack>
          <HStack className="justify-between">
            <Text size="sm" className="text-typography-600">
              {cartCopy.deposit}
            </Text>
            <Text size="sm" className="font-medium text-typography-900">
              {formatVndPrice(group.costs.depositVnd)}
            </Text>
          </HStack>
          <HStack className="justify-between">
            <Text size="sm" className="font-semibold text-typography-900">
              {cartCopy.totalAmount}
            </Text>
            <Text size="sm" className="font-bold text-tertiary-600">
              {formatVndPrice(group.costs.totalVnd)}
            </Text>
          </HStack>
        </VStack>

        <Input
          variant="outline"
          size="md"
          className="h-11 rounded-xl border border-outline-200 bg-background-0">
          <InputField
            placeholder={cartCopy.notePlaceholder}
            value={group.note}
            onChangeText={handleNoteChange}
            placeholderTextColor={lightTokens.typography500}
            className="text-typography-900"
          />
        </Input>

        <HStack className="w-full gap-3">
          <Pressable
            onPress={handleRemoveGroup}
            accessibilityRole="button"
            accessibilityLabel={cartCopy.deleteShop}
            style={[buttonFooterAction, buttonFlex, styles.deleteButton]}>
            <Text
              size="sm"
              className="font-semibold text-typography-0"
              style={buttonLabelStyle}>
              {cartCopy.deleteShop}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCreateGroupOrder}
            accessibilityRole="button"
            accessibilityLabel={cartCopy.createOrder}
            style={[buttonFooterAction, buttonFlex, styles.createButton]}>
            <Text
              size="sm"
              className="font-semibold text-typography-0"
              style={buttonLabelStyle}>
              {cartCopy.createOrder}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
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
  costRows: {
    paddingTop: 4,
  },
  deleteButton: {
    backgroundColor: lightTokens.error500,
  },
  createButton: {
    backgroundColor: lightTokens.tertiary500,
  },
});

export const CartGroupCard = memo(CartGroupCardComponent);
