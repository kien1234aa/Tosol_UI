import React, { memo, useCallback } from 'react';
import { InputIcon, InputSlot } from '@/src/uikits/input';
import { EyeIcon, EyeOffIcon } from '@/src/uikits/icon';
import { AuthTextField } from './AuthTextField';

interface PasswordFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  error?: string;
  testID?: string;
}

function PasswordFieldComponent({
  placeholder,
  value,
  onChangeText,
  showPassword,
  onToggleShowPassword,
  error,
  testID = 'password-input',
}: PasswordFieldProps) {
  const handleToggle = useCallback(() => {
    onToggleShowPassword();
  }, [onToggleShowPassword]);

  return (
    <AuthTextField
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      error={error}
      secureTextEntry={!showPassword}
      testID={testID}
      rightSlot={
        <InputSlot className="pr-4" onPress={handleToggle}>
          <InputIcon
            as={showPassword ? EyeIcon : EyeOffIcon}
            className="text-typography-500"
          />
        </InputSlot>
      }
    />
  );
}

export const PasswordField = memo(PasswordFieldComponent);
