import React, { forwardRef, memo, useCallback } from 'react';
import { InputIcon, InputSlot } from '@/src/uikits/input';
import { EyeIcon, EyeOffIcon } from '@/src/uikits/icon';
import { AuthTextField, type AuthTextFieldRef } from './AuthTextField';

interface PasswordFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  error?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
  testID?: string;
}

const PasswordFieldComponent = forwardRef<AuthTextFieldRef, PasswordFieldProps>(
  function PasswordFieldComponent(
    {
      placeholder,
      value,
      onChangeText,
      showPassword,
      onToggleShowPassword,
      error,
      returnKeyType,
      blurOnSubmit,
      onSubmitEditing,
      testID = 'password-input',
    },
    ref,
  ) {
    const handleToggle = useCallback(() => {
      onToggleShowPassword();
    }, [onToggleShowPassword]);

    return (
      <AuthTextField
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        error={error}
        secureTextEntry={!showPassword}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        onSubmitEditing={onSubmitEditing}
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
  },
);

export const PasswordField = memo(PasswordFieldComponent);
