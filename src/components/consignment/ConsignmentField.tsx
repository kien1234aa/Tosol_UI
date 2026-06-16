import React, { memo } from 'react';
import { StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/src/uikits/form-control';
import { Input, InputField } from '@/src/uikits/input';

interface ConsignmentFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

function ConsignmentFieldComponent({
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  keyboardType,
}: ConsignmentFieldProps) {
  const isInvalid = Boolean(error);

  return (
    <FormControl isInvalid={isInvalid} className="w-full">
      <Input
        variant="outline"
        size="xl"
        isInvalid={isInvalid}
        className="rounded-xl border border-outline-200 bg-background-0 data-[focus=true]:border-tertiary-500"
        style={[
          multiline ? styles.multilineInput : styles.input,
          isInvalid && styles.invalid,
        ]}>
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCorrect={false}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={lightTokens.typography500}
          className={multiline ? 'py-3 text-typography-900' : 'text-typography-900'}
        />
      </Input>

      {isInvalid ? (
        <FormControlError className="mt-1">
          <FormControlErrorText className="text-error-500">
            {error}
          </FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    height: 56,
  },
  multilineInput: {
    borderRadius: 12,
    minHeight: 96,
    height: undefined,
  },
  invalid: {
    borderColor: lightTokens.error500,
  },
});

export const ConsignmentField = memo(ConsignmentFieldComponent);
