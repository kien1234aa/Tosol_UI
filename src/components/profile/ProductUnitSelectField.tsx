import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import {
  PRODUCT_UNIT_OPTIONS,
  productsCopy,
  type ProductUnitValue,
} from '@/src/configs/products';
import { getProductUnitLabel } from '@/src/helpers/products';
import { lightTokens } from '@/src/configs/theme';
import { FormControl } from '@/src/uikits/form-control';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ProductUnitSelectFieldProps {
  value: ProductUnitValue;
  onChange: (value: ProductUnitValue) => void;
  disabled?: boolean;
}

function ProductUnitSelectFieldComponent({
  value,
  onChange,
  disabled = false,
}: ProductUnitSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const label = useMemo(() => getProductUnitLabel(value), [value]);

  const openPicker = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
    }
  }, [disabled]);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (nextValue: ProductUnitValue) => {
      onChange(nextValue);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <>
      <FormControl className="w-full">
        <VStack space="xs">
          <Text size="sm" className="font-medium text-typography-700">
            {productsCopy.unitLabel}
          </Text>
          <Pressable
            onPress={openPicker}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={productsCopy.unitLabel}
            className={`min-h-11 rounded-xl border border-outline-200 bg-background-0 px-3 py-2.5${
              disabled ? ' opacity-65' : ''
            }`}>
            <HStack className="items-center justify-between gap-2">
              <Text size="sm" className="flex-1 text-typography-900">
                {label}
              </Text>
              <ChevronDown color={lightTokens.typography500} size={16} />
            </HStack>
          </Pressable>
          <Text size="xs" className="text-typography-500">
            {productsCopy.unitHint}
          </Text>
        </VStack>
      </FormControl>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closePicker}>
        <Pressable
          style={styles.overlay}
          onPress={closePicker}
          accessibilityRole="button">
          <Pressable
            style={styles.sheet}
            onPress={() => {}}
            accessibilityRole="none">
            <Text size="md" className="mb-3 font-semibold text-typography-900">
              {productsCopy.unitPickerTitle}
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <VStack space="xs">
                {PRODUCT_UNIT_OPTIONS.map(option => {
                  const isSelected = option.value === value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      className={`rounded-xl px-3 py-3 ${
                        isSelected ? 'bg-tertiary-50' : ''
                      }`}>
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
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 24,
  },
  sheet: {
    maxHeight: '70%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    backgroundColor: lightTokens.background0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});

export const ProductUnitSelectField = memo(ProductUnitSelectFieldComponent);
