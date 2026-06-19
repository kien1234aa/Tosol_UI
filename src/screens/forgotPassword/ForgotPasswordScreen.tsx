import React, { useCallback, useEffect } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { fontStyle } from '@/src/configs/theme/fonts';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { forgotPasswordCopy } from '@/src/configs/forgotPassword';
import { useForgotPasswordForm, useResponsiveLayout } from '@/src/hooks';
import { animationConfig } from '@/src/configs/theme';
import type { RootStackScreenProps } from '@/src/navigation/types';
import { AuthBackButton, KeyboardAwareScreen } from '@/src/components/login';
import {
  ForgotPasswordFooterLinks,
  ForgotPasswordForm,
  ForgotPasswordHeroImage,
} from '@/src/components/forgotPassword';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  selectForgotPasswordSuccessMessage,
  selectIsForgotPasswordSuccess,
} from '@/src/redux/forgotPassword/forgotPasswordSelectors';

type ForgotPasswordScreenProps = RootStackScreenProps<'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const form = useForgotPasswordForm();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const isSuccess = useAppSelector(selectIsForgotPasswordSuccess);
  const successMessage = useAppSelector(selectForgotPasswordSuccessMessage);

  const handleBack = useCallback(() => {
    form.onReset();
    navigation.goBack();
  }, [form, navigation]);

  const handleLogin = useCallback(() => {
    form.onReset();
    navigation.replace('Login');
  }, [form, navigation]);

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    Alert.alert(
      forgotPasswordCopy.successTitle,
      successMessage ?? forgotPasswordCopy.successMessage,
      [
        {
          text: forgotPasswordCopy.loginCta,
          onPress: handleLogin,
        },
      ],
      { cancelable: false },
    );
  }, [handleLogin, isSuccess, successMessage]);

  const { stagger, screenEntry } = animationConfig;

  return (
    <KeyboardAwareScreen
      contentContainerStyle={{ paddingHorizontal: horizontalPadding }}>
      <Center className="w-full">
        <VStack
          className="w-full items-center gap-6"
          space="lg"
          style={[styles.content, { maxWidth: contentMaxWidth.form }]}>
          <Animated.View
            entering={FadeInDown.duration(screenEntry)}
            style={styles.fullWidth}>
            <AuthBackButton
              onPress={handleBack}
              accessibilityLabel={forgotPasswordCopy.backLabel}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger)}
            style={styles.fullWidthCenter}>
            <ForgotPasswordHeroImage />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger * 2)}
            style={styles.fullWidthCenter}>
            <VStack className="w-full items-center gap-2" space="xs">
              <Text
                size="lg"
                className="text-center font-semibold text-typography-900"
                style={styles.title}>
                {forgotPasswordCopy.title}
              </Text>
              <Text
                size="sm"
                className="px-2 text-center text-typography-500"
                style={styles.subtitle}>
                {forgotPasswordCopy.subtitle}
              </Text>
            </VStack>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger * 3)}
            style={styles.fullWidth}>
            <ForgotPasswordForm form={form} />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(screenEntry).delay(stagger * 4)}
            style={styles.fullWidth}>
            <ForgotPasswordFooterLinks onLogin={handleLogin} />
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
  subtitle: {
    lineHeight: 20,
  },
});
