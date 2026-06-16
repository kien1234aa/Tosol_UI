import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import HeroIllustration from '../components/HeroIllustration';
import LoginForm from '../components/LoginForm';
import LoginWelcomeHeader from '../components/LoginWelcomeHeader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useAppDispatch } from '../../../app/hooks';
import { login } from '@services/auth/authSlice';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { RADIUS } from '@shared/theme/designTokens';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const { height: winH, width: winW } = useWindowDimensions();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: isDark ? palette.bg : palette.bgLogin,
        },
        scroll: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          justifyContent: 'flex-end',
        },
        themeBar: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: Math.min(12, Math.max(8, winW * 0.03)),
          paddingTop: winH < 560 ? 2 : 4,
          paddingBottom: 0,
        },
        themeBtn: {
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? palette.bgButton : palette.surfaceWhite,
          borderWidth: 1,
          borderColor: isDark ? palette.border : palette.borderLightUi,
        },
        heroSection: {
          backgroundColor: isDark ? palette.bg : palette.bgLogin,
          paddingVertical: winH < 560 ? 4 : 8,
          paddingHorizontal: Math.min(16, Math.max(10, winW * 0.04)),
        },
        formCard: {
          width: '100%',
          backgroundColor: isDark ? palette.bgCard : palette.surfaceWhite,
          borderTopLeftRadius: RADIUS.sheet,
          borderTopRightRadius: RADIUS.sheet,
          borderTopWidth: isDark ? StyleSheet.hairlineWidth : 0,
          borderColor: palette.border,
          paddingTop: winH < 560 ? 18 : 24,
        },
      }),
    [palette, isDark, winH, winW],
  );

  const handleLogin = async (
    email: string,
    password: string,
    remember: boolean,
  ) => {
    try {
      await dispatch(login({ email, password, remember })).unwrap();
    } catch (e: unknown) {
      toast.error(String(e ?? 'Unknown error'));
    }
  };

  const handleForgotPassword = () => {
    toast.info(t('auth.forgotPasswordBody'));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.themeBar}>
        <Pressable
          onPress={toggleMode}
          style={({ pressed }) => [
            styles.themeBtn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isDark ? t('auth.a11yThemeToLight') : t('auth.a11yThemeToDark')
          }
        >
          <SystemIcon
            name={isDark ? 'sunny' : 'moon'}
            size={22}
            color={palette.textSecondary}
          />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.heroSection}>
          <HeroIllustration panelVariant={isDark ? 'dark' : 'light'} />
        </View>

        <View style={styles.formCard}>
          <LoginWelcomeHeader />

          <LoginForm
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
