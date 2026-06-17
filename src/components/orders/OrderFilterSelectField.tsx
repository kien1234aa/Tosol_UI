import React, { memo, useCallback, useState } from 'react';
import {
  Modal,
  Pressable as RNPressable,
  StyleSheet,
  View,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import type { OrderFilterSelectOption } from '@/src/types/orders/orderFilters.types';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface OrderFilterSelectFieldProps {
  label: string;
  value: string;
  options: OrderFilterSelectOption[];
  selectedValue: string;
  placeholder: string;
  pickerTitle: string;
  onSelect: (value: string) => void;
}

function OrderFilterSelectFieldComponent({
  label,
  value,
  options,
  selectedValue,
  placeholder,
  pickerTitle,
  onSelect,
}: OrderFilterSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = selectedValue ? value : placeholder;
  const isPlaceholder = !selectedValue;

  const openPicker = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (nextValue: string) => {
      onSelect(nextValue);
      setIsOpen(false);
    },
    [onSelect],
  );

  return (
    <>
      <View style={styles.wrapper}>
        <Text size="xs" className="mb-1.5 text-typography-500">
          {label}
        </Text>
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          style={styles.field}>
          <Text
            size="sm"
            numberOfLines={1}
            className={
              isPlaceholder
                ? 'flex-1 text-typography-400'
                : 'flex-1 text-typography-900'
            }>
            {displayValue}
          </Text>
          <ChevronDown color={lightTokens.typography500} size={18} />
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closePicker}>
        <RNPressable style={styles.overlay} onPress={closePicker}>
          <RNPressable style={styles.sheet} onPress={() => {}}>
            <Text size="md" className="mb-3 font-semibold text-typography-900">
              {pickerTitle}
            </Text>
            <VStack space="xs">
              {options.map(option => {
                const isSelected = option.value === selectedValue;

                return (
                  <Pressable
                    key={option.value || 'all'}
                    onPress={() => handleSelect(option.value)}
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
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
  },
  field: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
    backgroundColor: lightTokens.background0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
    maxHeight: '70%',
  },
  option: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: lightTokens.tertiary50,
  },
});

export const OrderFilterSelectField = memo(OrderFilterSelectFieldComponent);
