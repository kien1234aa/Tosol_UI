import React, { memo } from 'react';
import { ActivityIndicator, Platform, StyleSheet, TextInput, type KeyboardTypeOptions } from 'react-native';
import { createOrderCopy } from '@/src/configs/createOrder/createOrder.constants';
import { lightTokens } from '@/src/configs/theme';
import { fonts } from '@/src/configs/theme/fonts';
import { fontSizes, lineHeights } from '@/src/configs/theme/typography';
import { Box } from '@/src/uikits/box';
import {
  FormControl,
} from '@/src/uikits/form-control';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

export const createOrderFieldShellClass =
  'min-h-[52px] justify-center rounded-xl border border-outline-200 bg-background-0 px-3 py-3';

export const createOrderFieldIconWrapClass = 'items-center justify-center';

/** Khớp placeholder ô select (`text-typography-400`). */
const createOrderFieldPlaceholderColor = 'rgb(140, 148, 154)';

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
    <HStack className="mb-1.5 items-center">
      <Text size="xs" className="font-normal text-typography-500">
        {label}
      </Text>
      {required ? (
        <Text size="xs" className="text-error-500">
          {createOrderCopy.requiredMark}
        </Text>
      ) : null}
    </HStack>
  );
}

export const CreateOrderFieldLabel = memo(CreateOrderFieldLabelComponent);

interface CreateOrderTextInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

function CreateOrderTextInputComponent({
  value,
  onChangeText,
  placeholder,
  leadingIcon,
  trailingIcon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
}: CreateOrderTextInputProps) {
  return (
    <Box className={createOrderFieldShellClass}>
      <HStack className="items-center gap-2">
        {leadingIcon ? (
          <HStack className={createOrderFieldIconWrapClass}>{leadingIcon}</HStack>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={createOrderFieldPlaceholderColor}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          style={styles.textInput}
        />
        {trailingIcon ? (
          <HStack className={createOrderFieldIconWrapClass}>{trailingIcon}</HStack>
        ) : null}
      </HStack>
    </Box>
  );
}

export const CreateOrderTextInput = memo(CreateOrderTextInputComponent);

interface CreateOrderTextFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  leadingIcon: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
}

function CreateOrderTextFieldComponent({
  label,
  required = false,
  value,
  onChangeText,
  leadingIcon,
  keyboardType = 'default',
  autoCapitalize,
  placeholder,
}: CreateOrderTextFieldProps) {
  return (
    <FormControl className="w-full">
      <CreateOrderFieldLabel label={label} required={required} />
      <CreateOrderTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leadingIcon={leadingIcon}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
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
          {leadingIcon ? (
            <HStack className={createOrderFieldIconWrapClass}>{leadingIcon}</HStack>
          ) : null}
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
  action?: React.ReactNode;
}

function CreateOrderSectionHeaderComponent({
  number,
  title,
  action,
}: CreateOrderSectionHeaderProps) {
  return (
    <HStack className="mb-5 items-center justify-between">
      <HStack className="min-w-0 flex-1 items-center gap-2">
        <Box className="h-6 w-6 items-center justify-center rounded-full bg-tertiary-500">
          <Text size="xs" className="font-bold text-typography-0">
            {number}
          </Text>
        </Box>
        <Text size="md" className="font-bold text-typography-900">
          {title}
        </Text>
      </HStack>
      {action ?? null}
    </HStack>
  );
}

export const CreateOrderSectionHeader = memo(CreateOrderSectionHeaderComponent);

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: lightTokens.typography900,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    ...Platform.select({
      // Khớp InputField hệ thống: ios:leading-[0px] → căn giữa như dropdown.
      ios: {
        lineHeight: 0,
      },
      android: {
        lineHeight: lineHeights.sm,
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
      default: {
        lineHeight: lineHeights.sm,
      },
    }),
  },
});
