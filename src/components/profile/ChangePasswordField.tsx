import React, { memo, useCallback } from 'react';
import { EyeIcon, EyeOffIcon } from '@/src/uikits/icon';
import { lightTokens } from '@/src/configs/theme';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/src/uikits/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/src/uikits/input';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ChangePasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  testID?: string;
}

function ChangePasswordFieldComponent({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  showPassword,
  onToggleShowPassword,
  testID,
}: ChangePasswordFieldProps) {
  const isInvalid = Boolean(error);

  const handleToggle = useCallback(() => {
    onToggleShowPassword();
  }, [onToggleShowPassword]);

  return (
    <FormControl isInvalid={isInvalid} className="w-full">
      <VStack space="xs">
        <Text size="sm" className="font-medium text-typography-700">
          {label}
        </Text>
        <Input
          variant="outline"
          size="md"
          isInvalid={isInvalid}
          className="min-h-11 rounded-xl border border-outline-200 bg-background-0 data-[focus=true]:border-tertiary-500">
          <InputField
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            testID={testID}
            placeholderTextColor={lightTokens.typography500}
            className="text-typography-900"
          />
          <InputSlot className="pr-3" onPress={handleToggle}>
            <InputIcon
              as={showPassword ? EyeIcon : EyeOffIcon}
              className="text-typography-500"
            />
          </InputSlot>
        </Input>
      </VStack>

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

export const ChangePasswordField = memo(ChangePasswordFieldComponent);
