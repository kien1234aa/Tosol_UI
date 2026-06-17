import React, { memo, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { createOrderCopy } from '@/src/configs/cart/createOrder.constants';
import { lightTokens } from '@/src/configs/theme';
import type { CreateOrderSelectOption } from '@/src/types/orders/createOrder.types';
import { FormControl } from '@/src/uikits/form-control';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import {
  CreateOrderFieldLabel,
  createOrderFieldShellClass,
} from './createOrderFormFields';

interface CreateOrderSelectFieldProps {
  label: string;
  required?: boolean;
  value: string;
  options: CreateOrderSelectOption[];
  selectedId: number | null;
  placeholder: string;
  pickerTitle: string;
  isLoading?: boolean;
  disabled?: boolean;
  formatOptionLabel?: (option: CreateOrderSelectOption) => string;
  leadingIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onSelect: (id: number) => void;
}

function CreateOrderSelectFieldComponent({
  label,
  required = false,
  value,
  options,
  selectedId,
  placeholder,
  pickerTitle,
  isLoading = false,
  disabled = false,
  formatOptionLabel,
  leadingIcon,
  style,
  onSelect,
}: CreateOrderSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDisabled = disabled || isLoading || options.length === 0;

  const openPicker = useCallback(() => {
    if (!isDisabled) {
      setIsOpen(true);
    }
  }, [isDisabled]);

  const closePicker = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (id: number) => {
      onSelect(id);
      setIsOpen(false);
    },
    [onSelect],
  );

  const displayValue = selectedId != null ? value : placeholder;
  const isPlaceholder = selectedId == null;

  return (
    <>
      <FormControl className="w-full" style={style}>
        <CreateOrderFieldLabel label={label} required={required} />

        <Pressable
          onPress={openPicker}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: isDisabled }}
          className={`${createOrderFieldShellClass}${isDisabled ? ' opacity-65' : ''}`}>
          <HStack className="items-center gap-2">
            {leadingIcon ? (
              <HStack className="items-center justify-center">{leadingIcon}</HStack>
            ) : null}
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
            {isLoading ? (
              <ActivityIndicator color={lightTokens.tertiary600} size="small" />
            ) : (
              <ChevronDown color={lightTokens.typography500} size={16} />
            )}
          </HStack>
        </Pressable>
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
              {pickerTitle}
            </Text>

            {options.length === 0 ? (
              <Text size="sm" className="py-3 text-typography-500">
                {createOrderCopy.noOptions}
              </Text>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <VStack space="xs">
                  {options.map(option => {
                    const isSelected = option.id === selectedId;
                    const optionLabel = formatOptionLabel
                      ? formatOptionLabel(option)
                      : option.label;

                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => handleSelect(option.id)}
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
                          {optionLabel}
                        </Text>
                        {option.subtitle && !formatOptionLabel ? (
                          <Text size="xs" className="mt-0.5 text-typography-500">
                            {option.subtitle}
                          </Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </VStack>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export const CreateOrderSelectField = memo(CreateOrderSelectFieldComponent);

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
