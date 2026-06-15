import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { authCopy } from '@/src/core/constants';
import { useResponsiveLayout } from '@/src/core/hooks';
import { animationConfig } from '@/src/core/theme';
import { KeyboardAwareScreen } from '@/src/shared/layouts';
import type { RootStackScreenProps } from '@/src/navigation/types';
import { AuthFooterLinks } from '../components/AuthFooterLinks';
import { BrandMascot } from '../components/BrandMascot';
import { LoginForm } from '../components/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';

type LoginScreenProps = RootStackScreenProps<'Login'>;

export function LoginScreen(_props: LoginScreenProps) {
  const form = useLoginForm();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();

  const handleForgotPassword = useCallback(() => {}, []);
  const handleRegister = useCallback(() => {}, []);

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
            <BrandMascot />
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
            <LoginForm form={form} />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(screenEntry).delay(stagger * 3)}
            style={styles.fullWidth}>
            <AuthFooterLinks
              onForgotPassword={handleForgotPassword}
              onRegister={handleRegister}
            />
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
  title: {
    fontWeight: '600',
  },
});
