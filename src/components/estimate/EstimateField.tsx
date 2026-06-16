import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { lightTokens } from '@/src/configs/theme';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/src/uikits/form-control';
import { Input, InputField } from '@/src/uikits/input';

interface EstimateFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  className?: string;
}

function EstimateFieldComponent({
  placeholder,
  value,
  onChangeText,
  error,
  className = 'w-full',
}: EstimateFieldProps) {
  const isInvalid = Boolean(error);

  return (
    <FormControl isInvalid={isInvalid} className={className}>
      <Input
        variant="outline"
        size="xl"
        isInvalid={isInvalid}
        className="rounded-xl border border-outline-200 bg-background-0 data-[focus=true]:border-tertiary-500"
        style={[styles.input, isInvalid && styles.invalid]}>
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          autoCorrect={false}
          placeholderTextColor={lightTokens.typography500}
          className="text-typography-900"
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
  invalid: {
    borderColor: lightTokens.error500,
  },
});

export const EstimateField = memo(EstimateFieldComponent);
