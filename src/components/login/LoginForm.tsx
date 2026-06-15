import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { authCopy } from '@/src/configs';
import { usePressScale } from '@/src/hooks';
import { lightColors } from '@/src/configs/theme';
import type { UseLoginFormResult } from '@/src/hooks/login';
import { AuthTextField } from './AuthTextField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';

interface LoginFormProps {
  form: UseLoginFormResult;
}

function LoginFormComponent({ form }: LoginFormProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <VStack className="w-full gap-4" space="md">
      <AuthTextField
        placeholder={authCopy.usernamePlaceholder}
        value={form.username}
        onChangeText={form.onChangeUsername}
        error={form.errors.username}
        testID="username-input"
      />

      <PasswordField
        placeholder={authCopy.passwordPlaceholder}
        value={form.password}
        onChangeText={form.onChangePassword}
        showPassword={form.showPassword}
        onToggleShowPassword={form.onToggleShowPassword}
        error={form.errors.password}
      />

      <RememberMeCheckbox
        label={authCopy.rememberMe}
        isChecked={form.rememberMe}
        onChange={form.onToggleRememberMe}
      />

      {form.serverError ? (
        <Text className="text-error-500" size="sm">
          {form.serverError}
        </Text>
      ) : null}

      <Animated.View style={animatedStyle}>
        <Button
          size="xl"
          className="mt-2 h-14 w-full rounded-2xl"
          style={styles.submitButton}
          isDisabled={form.isSubmitting}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={form.onSubmit}>
          {form.isSubmitting ? <ButtonSpinner color={lightColors.background0} /> : null}
          <ButtonText className="text-base font-semibold text-white">
            {authCopy.submit}
          </ButtonText>
        </Button>
      </Animated.View>
    </VStack>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: lightColors.brandOrange,
    borderRadius: 16,
    height: 56,
  },
});

export const LoginForm = memo(LoginFormComponent);
