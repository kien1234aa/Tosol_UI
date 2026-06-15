import React, { memo, useCallback } from 'react';
import { InputIcon, InputSlot } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { AuthTextField } from './AuthTextField';

interface PasswordFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  error?: string;
}

function PasswordFieldComponent({
  placeholder,
  value,
  onChangeText,
  showPassword,
  onToggleShowPassword,
  error,
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
      testID="password-input"
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
