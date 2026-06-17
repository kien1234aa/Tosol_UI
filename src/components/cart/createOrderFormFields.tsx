import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { createOrderCopy } from '@/src/configs/cart/createOrder.constants';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelAstrick,
  FormControlLabelText,
} from '@/src/uikits/form-control';
import { HStack } from '@/src/uikits/hstack';
import { Input, InputField } from '@/src/uikits/input';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

export const createOrderFieldShellClass =
  'min-h-[52px] justify-center rounded-xl border border-outline-200 bg-background-0 px-3 py-3';

export const createOrderFieldReadOnlyClass = 'bg-background-50';

export const createOrderSectionCardClass =
  'mb-3 rounded-2xl border border-outline-100 bg-background-0 px-3.5 py-4';

interface CreateOrderFieldLabelProps {
  label: string;
  required?: boolean;
}

function CreateOrderFieldLabelComponent({
  label,
  required = false,
}: CreateOrderFieldLabelProps) {
  return (
    <FormControlLabel className="mb-1.5">
      <FormControlLabelText className="text-xs font-normal text-typography-500">
        {label}
      </FormControlLabelText>
      {required ? (
        <FormControlLabelAstrick className="text-xs text-error-500">
          {createOrderCopy.requiredMark}
        </FormControlLabelAstrick>
      ) : null}
    </FormControlLabel>
  );
}

export const CreateOrderFieldLabel = memo(CreateOrderFieldLabelComponent);

interface CreateOrderTextFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  leadingIcon: React.ReactNode;
  keyboardType?: 'default' | 'phone-pad';
  placeholder?: string;
}

function CreateOrderTextFieldComponent({
  label,
  required = false,
  value,
  onChangeText,
  leadingIcon,
  keyboardType = 'default',
  placeholder,
}: CreateOrderTextFieldProps) {
  return (
    <FormControl className="w-full">
      <CreateOrderFieldLabel label={label} required={required} />
      <Box className={createOrderFieldShellClass}>
        <HStack className="items-center gap-2">
          {leadingIcon}
          <Input
            variant="outline"
            size="md"
            className="h-7 flex-1 border-0 bg-transparent shadow-none">
            <InputField
              value={value}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              placeholder={placeholder}
              placeholderTextColor={lightTokens.typography500}
              className="px-0 text-sm text-typography-900"
            />
          </Input>
        </HStack>
      </Box>
    </FormControl>
  );
}

export const CreateOrderTextField = memo(CreateOrderTextFieldComponent);

interface CreateOrderDisplayFieldProps {
  label: string;
  value: string;
  leadingIcon: React.ReactNode;
  isLoading?: boolean;
}

function CreateOrderDisplayFieldComponent({
  label,
  value,
  leadingIcon,
  isLoading = false,
}: CreateOrderDisplayFieldProps) {
  return (
    <FormControl className="w-full">
      <CreateOrderFieldLabel label={label} />
      <Box className={`${createOrderFieldShellClass} ${createOrderFieldReadOnlyClass}`}>
        <HStack className="items-center gap-2">
          {leadingIcon}
          {isLoading ? (
            <ActivityIndicator color={lightTokens.tertiary600} size="small" />
          ) : (
            <Text size="sm" className="flex-1 font-semibold text-typography-900">
              {value}
            </Text>
          )}
        </HStack>
      </Box>
    </FormControl>
  );
}

export const CreateOrderDisplayField = memo(CreateOrderDisplayFieldComponent);

interface CreateOrderShippingRadioProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function CreateOrderShippingRadioComponent({
  label,
  selected,
  onPress,
}: CreateOrderShippingRadioProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="flex-row items-center gap-2.5">
      <Box
        className={`h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
          selected ? 'border-tertiary-500' : 'border-outline-200'
        }`}>
        {selected ? (
          <Box className="h-2 w-2 rounded-full bg-tertiary-500" />
        ) : null}
      </Box>
      <Text size="sm" className="flex-1 text-typography-900">
        {label}
      </Text>
    </Pressable>
  );
}

export const CreateOrderShippingRadio = memo(CreateOrderShippingRadioComponent);

interface CreateOrderSectionHeaderProps {
  number: number;
  title: string;
}

function CreateOrderSectionHeaderComponent({
  number,
  title,
}: CreateOrderSectionHeaderProps) {
  return (
    <HStack className="mb-5 items-center gap-2">
      <Box className="h-6 w-6 items-center justify-center rounded-full bg-tertiary-500">
        <Text size="xs" className="font-bold text-typography-0">
          {number}
        </Text>
      </Box>
      <Text size="md" className="font-bold text-typography-900">
        {title}
      </Text>
    </HStack>
  );
}

export const CreateOrderSectionHeader = memo(CreateOrderSectionHeaderComponent);
