import React, { memo } from 'react';
import { Modal, Pressable as RNPressable, StyleSheet } from 'react-native';
import { ordersCopy } from '@/src/configs/orders';
import { lightTokens } from '@/src/configs/theme';
import type { OrderFilterOption } from '@/src/hooks/orders/useOrdersList';
import type { OrderStatusFilter } from '@/src/types/orders/orders.types';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface OrderFilterSheetProps {
  visible: boolean;
  options: OrderFilterOption[];
  selectedFilter: OrderStatusFilter;
  onClose: () => void;
  onSelect: (filter: OrderStatusFilter) => void;
}

function OrderFilterSheetComponent({
  visible,
  options,
  selectedFilter,
  onClose,
  onSelect,
}: OrderFilterSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <RNPressable style={styles.overlay} onPress={onClose}>
        <RNPressable style={styles.sheet} onPress={() => {}}>
          <Text size="md" className="mb-3 font-semibold text-typography-900">
            {ordersCopy.filterTitle}
          </Text>
          <VStack space="xs">
            {options.map(option => {
              const isSelected = option.key === selectedFilter;

              return (
                <Pressable
                  key={option.key}
                  onPress={() => onSelect(option.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.option, isSelected && styles.optionSelected]}>
                  <Text
                    size="sm"
                    className={
                      isSelected
                        ? 'font-semibold text-tertiary-700'
                        : 'text-typography-900'
                    }>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </VStack>
        </RNPressable>
      </RNPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  option: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: lightTokens.tertiary50,
  },
});

export const OrderFilterSheet = memo(OrderFilterSheetComponent);
