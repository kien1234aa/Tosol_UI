import React, { memo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { VStack } from '@/src/uikits/vstack';
import { registerCopy } from '@/src/configs/register';
import { usePressScale } from '@/src/hooks';
import { lightTokens } from '@/src/configs/theme';
import type { UseRegisterFormResult } from '@/src/hooks/register';
import { focusInputRef } from '@/src/shared/utils/focusInputRef';
import { AuthTextField, type AuthTextFieldRef } from '@/src/components/login/AuthTextField';
import { AuthServerMessage } from '@/src/components/login/AuthServerMessage';
import { PasswordField } from '@/src/components/login/PasswordField';

interface RegisterFormProps {
  form: UseRegisterFormResult;
}

function RegisterFormComponent({ form }: RegisterFormProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();
  const emailRef = useRef<AuthTextFieldRef>(null);
  const passwordRef = useRef<AuthTextFieldRef>(null);
  const confirmPasswordRef = useRef<AuthTextFieldRef>(null);

  return (
    <VStack className="w-full gap-4" space="md">
      <AuthTextField
        placeholder={registerCopy.usernamePlaceholder}
        value={form.username}
        onChangeText={form.onChangeUsername}
        error={form.errors.username}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => focusInputRef(emailRef)}
        testID="register-username-input"
      />

      <AuthTextField
        ref={emailRef}
        placeholder={registerCopy.emailPlaceholder}
        value={form.email}
        onChangeText={form.onChangeEmail}
        error={form.errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => focusInputRef(passwordRef)}
        testID="register-email-input"
      />

      <PasswordField
        ref={passwordRef}
        placeholder={registerCopy.passwordPlaceholder}
        value={form.password}
        onChangeText={form.onChangePassword}
        showPassword={form.showPassword}
        onToggleShowPassword={form.onToggleShowPassword}
        error={form.errors.password}
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => focusInputRef(confirmPasswordRef)}
        testID="register-password-input"
      />

      <PasswordField
        ref={confirmPasswordRef}
        placeholder={registerCopy.confirmPasswordPlaceholder}
        value={form.confirmPassword}
        onChangeText={form.onChangeConfirmPassword}
        showPassword={form.showConfirmPassword}
        onToggleShowPassword={form.onToggleShowConfirmPassword}
        error={form.errors.confirmPassword}
        returnKeyType="done"
        onSubmitEditing={form.onSubmit}
        testID="register-confirm-password-input"
      />

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
            {registerCopy.submit}
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
});

export const RegisterForm = memo(RegisterFormComponent);
