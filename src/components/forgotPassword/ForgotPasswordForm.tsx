import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { VStack } from '@/src/uikits/vstack';
import { forgotPasswordCopy } from '@/src/configs/forgotPassword';
import { usePressScale } from '@/src/hooks';
import { lightTokens } from '@/src/configs/theme';
import type { UseForgotPasswordFormResult } from '@/src/hooks/forgotPassword';
import { AuthTextField } from '@/src/components/login/AuthTextField';
import { AuthServerMessage } from '@/src/components/login/AuthServerMessage';

interface ForgotPasswordFormProps {
  form: UseForgotPasswordFormResult;
}

function ForgotPasswordFormComponent({ form }: ForgotPasswordFormProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <VStack className="w-full gap-4" space="md">
      <AuthTextField
        placeholder={forgotPasswordCopy.emailPlaceholder}
        value={form.email}
        onChangeText={form.onChangeEmail}
        error={form.errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={form.onSubmit}
        testID="forgot-password-email-input"
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
            {forgotPasswordCopy.submit}
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

export const ForgotPasswordForm = memo(ForgotPasswordFormComponent);
