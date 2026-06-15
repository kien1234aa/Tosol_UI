import React, { memo, type ReactNode } from 'react';
import { StyleSheet, type KeyboardTypeOptions } from 'react-native';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/src/uikits/form-control';
import { Input, InputField } from '@/src/uikits/input';
import { lightTokens } from '@/src/configs/theme';

export interface AuthTextFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  /** Rendered inside the input (e.g. a password visibility toggle). */
  rightSlot?: ReactNode;
  testID?: string;
}

function AuthTextFieldComponent({
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType,
  rightSlot,
  testID,
}: AuthTextFieldProps) {
  const isInvalid = Boolean(error);

  return (
    <FormControl isInvalid={isInvalid} className="w-full">
      <Input
        variant="rounded"
        size="xl"
        isInvalid={isInvalid}
        className="h-14 rounded-2xl border border-outline-100 bg-secondary-200 data-[focus=true]:border-outline-300"
        style={[styles.input, isInvalid && styles.inputInvalid]}>
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          testID={testID}
          placeholderTextColor={lightTokens.typography500}
          className="text-typography-900"
        />
        {rightSlot}
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
    borderRadius: 16,
    height: 56,
  },
  inputInvalid: {
    borderColor: lightTokens.error500,
  },
});

export const AuthTextField = memo(AuthTextFieldComponent);
