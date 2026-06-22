import React, { memo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { authCopy } from '@/src/configs';
import { usePressScale } from '@/src/hooks';
import { lightTokens } from '@/src/configs/theme';
import type { UseLoginFormResult } from '@/src/hooks/login';
import { focusInputRef } from '@/src/shared/utils/focusInputRef';
import { AuthTextField, type AuthTextFieldRef } from './AuthTextField';
import { AuthServerMessage } from './AuthServerMessage';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';

interface LoginFormProps {
  form: UseLoginFormResult;
  onForgotPassword?: () => void;
}

function LoginFormComponent({ form, onForgotPassword }: LoginFormProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();
  const passwordRef = useRef<AuthTextFieldRef>(null);

  return (
    <VStack className="w-full gap-4" space="md">
      <AuthTextField
        placeholder={authCopy.usernamePlaceholder}
        value={form.username}
        onChangeText={form.onChangeUsername}
        error={form.errors.username}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => focusInputRef(passwordRef)}
        testID="username-input"
      />

      <PasswordField
        ref={passwordRef}
        placeholder={authCopy.passwordPlaceholder}
        value={form.password}
        onChangeText={form.onChangePassword}
        showPassword={form.showPassword}
        onToggleShowPassword={form.onToggleShowPassword}
        error={form.errors.password}
        returnKeyType="done"
        onSubmitEditing={form.onSubmit}
      />

      <HStack className="w-full items-center justify-between">
        <RememberMeCheckbox
          label={authCopy.rememberMe}
          isChecked={form.rememberMe}
          onChange={form.onToggleRememberMe}
        />

        {onForgotPassword ? (
          <Pressable
            onPress={onForgotPassword}
            accessibilityRole="button"
            accessibilityLabel={authCopy.forgotPasswordCta}>
            <Text
              size="sm"
              className="font-medium"
              style={styles.forgotPasswordLink}>
              {authCopy.forgotPasswordCta}
            </Text>
          </Pressable>
        ) : null}
      </HStack>

      {form.serverError ? (
        <AuthServerMessage message={form.serverError} />
      ) : null}

      <Animated.View style={animatedStyle}>
        <Button
          size="xl"
          action="default"
          variant="solid"
          className="mt-2 h-14 w-full rounded-2xl border-0"
          style={styles.submitButton}
          isDisabled={form.isSubmitting}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={form.onSubmit}>
          {form.isSubmitting ? (
            <ButtonSpinner color={lightTokens.typography0} />
          ) : null}
          <ButtonText className="text-base font-semibold text-typography-0">
            {authCopy.submit}
          </ButtonText>
        </Button>
      </Animated.View>
    </VStack>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: lightTokens.tertiary500,
    borderRadius: 16,
    height: 56,
  },
  forgotPasswordLink: {
    color: lightTokens.tertiary500,
  },
});

export const LoginForm = memo(LoginFormComponent);
