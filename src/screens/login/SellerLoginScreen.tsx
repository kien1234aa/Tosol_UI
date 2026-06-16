import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { fontStyle } from '@/src/configs/theme/fonts';
import { authCopy } from '@/src/configs';
import { animationConfig } from '@/src/configs/theme';
import { useResponsiveLayout } from '@/src/hooks';
import { useSellerLoginForm } from '@/src/hooks/login/useSellerLoginForm';
import {
  LoginHeroImage,
  KeyboardAwareScreen,
} from '@/src/components/login';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { AuthTextField } from '@/src/components/login/AuthTextField';
import { PasswordField } from '@/src/components/login/PasswordField';
import { RememberMeCheckbox } from '@/src/components/login/RememberMeCheckbox';
import { lightTokens } from '@/src/configs/theme';

/**
 * Seller login — Gluestack UI wired to TOSOL auth slice (role blocking, warehouse session).
 */
export function SellerLoginScreen() {
  const form = useSellerLoginForm();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const { stagger, screenEntry } = animationConfig;

  return (
    <KeyboardAwareScreen
      contentContainerStyle={{ paddingHorizontal: horizontalPadding }}>
      <Center className="w-full">
        <VStack
          className="w-full items-center gap-6"
          space="lg"
          style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <Animated.View
            entering={FadeInDown.duration(screenEntry)}
            style={styles.fullWidthCenter}>
            <LoginHeroImage />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger)}
            style={styles.fullWidthCenter}>
            <Text
              size="lg"
              className="text-center font-semibold text-typography-900"
              style={styles.title}>
              {authCopy.title}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger * 2)}
            style={styles.fullWidth}>
            <VStack className="w-full gap-4" space="md">
              <AuthTextField
                placeholder={authCopy.usernamePlaceholder}
                value={form.email}
                onChangeText={form.onChangeEmail}
                error={form.errors.username}
                testID="email-input"
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
              <Button
                size="xl"
                action="default"
                variant="solid"
                className="mt-2 h-14 w-full rounded-2xl border-0"
                style={styles.submitButton}
                isDisabled={form.isSubmitting}
                onPress={form.onSubmit}>
                {form.isSubmitting ? (
                  <ButtonSpinner color={lightTokens.typography0} />
                ) : null}
                <ButtonText className="text-base font-semibold text-typography-0">
                  {authCopy.submit}
                </ButtonText>
              </Button>
            </VStack>
          </Animated.View>
        </VStack>
      </Center>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    paddingVertical: 16,
  },
  fullWidth: {
    width: '100%',
  },
  fullWidthCenter: {
    width: '100%',
    alignItems: 'center',
  },
  title: fontStyle('semibold'),
  submitButton: {
    backgroundColor: lightTokens.tertiary500,
    borderRadius: 16,
    height: 56,
  },
});
