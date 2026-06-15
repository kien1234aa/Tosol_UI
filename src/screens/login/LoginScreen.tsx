import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { authCopy } from '@/src/configs';
import { useLoginForm, useResponsiveLayout } from '@/src/hooks';
import { animationConfig } from '@/src/configs/theme';
import type { RootStackScreenProps } from '@/src/navigation/types';
import {
  AuthFooterLinks,
  LoginHeroImage,
  KeyboardAwareScreen,
  LoginForm,
} from '@/src/components/login';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectIsAuthenticated } from '@/src/redux/login/authSelectors';

type LoginScreenProps = RootStackScreenProps<'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const form = useLoginForm();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [isAuthenticated, navigation]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);
  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

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
