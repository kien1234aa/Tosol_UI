import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { forgotPasswordCopy } from '@/src/configs/forgotPassword';
import { useForgotPasswordForm, useResponsiveLayout } from '@/src/hooks';
import { animationConfig } from '@/src/configs/theme';
import type { RootStackScreenProps } from '@/src/navigation/types';
import { KeyboardAwareScreen } from '@/src/components/login';
import {
  ForgotPasswordFooterLinks,
  ForgotPasswordForm,
  ForgotPasswordHeader,
  ForgotPasswordHeroImage,
} from '@/src/components/forgotPassword';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectIsForgotPasswordSuccess } from '@/src/redux/forgotPassword/forgotPasswordSelectors';

type ForgotPasswordScreenProps = RootStackScreenProps<'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const form = useForgotPasswordForm();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const isSuccess = useAppSelector(selectIsForgotPasswordSuccess);

  const handleBack = useCallback(() => {
    form.onReset();
    navigation.goBack();
  }, [form, navigation]);

  const handleLogin = useCallback(() => {
    form.onReset();
    navigation.replace('Login');
  }, [form, navigation]);

  useEffect(() => {
    if (isSuccess) {
      form.onReset();
      navigation.replace('Login');
    }
  }, [form, isSuccess, navigation]);

  const { stagger, screenEntry } = animationConfig;

  return (
    <Box className="flex-1 bg-background-50">
      <ForgotPasswordHeader
        title={forgotPasswordCopy.title}
        onBack={handleBack}
      />

      <KeyboardAwareScreen
        edges={['bottom', 'left', 'right']}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}>
        <Center className="w-full">
          <VStack
            className="w-full items-center gap-6"
            space="lg"
            style={[styles.content, { maxWidth: contentMaxWidth }]}>
            <Animated.View
              entering={FadeInDown.duration(screenEntry)}
              style={styles.fullWidthCenter}>
              <ForgotPasswordHeroImage />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(screenEntry).delay(stagger)}
              style={styles.fullWidthCenter}>
              <Text
                size="md"
                className="px-2 text-center text-typography-900"
                style={styles.subtitle}>
                {forgotPasswordCopy.subtitle}
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(screenEntry).delay(stagger * 2)}
              style={styles.fullWidth}>
              <ForgotPasswordForm form={form} />
            </Animated.View>

            <Animated.View
              entering={FadeIn.duration(screenEntry).delay(stagger * 3)}
              style={styles.fullWidth}>
              <ForgotPasswordFooterLinks onLogin={handleLogin} />
            </Animated.View>
          </VStack>
        </Center>
      </KeyboardAwareScreen>
    </Box>
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
  subtitle: {
    lineHeight: 22,
  },
});
