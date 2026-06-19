import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { fontStyle } from '@/src/configs/theme/fonts';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { registerCopy } from '@/src/configs/register';
import { useRegisterForm, useResponsiveLayout } from '@/src/hooks';
import { useFeatureInDevelopmentNotice } from '@/src/hooks/common';
import { animationConfig } from '@/src/configs/theme';
import type { RootStackScreenProps } from '@/src/navigation/types';
import { KeyboardAwareScreen } from '@/src/components/login';
import {
  RegisterForm,
  RegisterFooterLinks,
  RegisterHeroImage,
} from '@/src/components/register';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectIsRegisterSuccess } from '@/src/redux/register/registerSelectors';

type RegisterScreenProps = RootStackScreenProps<'Register'>;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  useFeatureInDevelopmentNotice();
  const form = useRegisterForm();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const isRegisterSuccess = useAppSelector(selectIsRegisterSuccess);

  const handleLogin = useCallback(() => {
    form.onReset();
    navigation.replace('Login');
  }, [form, navigation]);

  useEffect(() => {
    if (isRegisterSuccess) {
      form.onReset();
      navigation.replace('Login');
    }
  }, [form, isRegisterSuccess, navigation]);

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
            style={styles.fullWidthCenter}>
            <RegisterHeroImage />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger)}
            style={styles.fullWidthCenter}>
            <Text
              size="lg"
              className="text-center font-semibold text-typography-900"
              style={styles.title}>
              {registerCopy.title}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(screenEntry).delay(stagger * 2)}
            style={styles.fullWidth}>
            <RegisterForm form={form} />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(screenEntry).delay(stagger * 3)}
            style={styles.fullWidth}>
            <RegisterFooterLinks onLogin={handleLogin} />
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
});
