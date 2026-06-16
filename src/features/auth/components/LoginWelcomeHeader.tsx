import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppLogo } from '@shared/components/ui/AppLogo';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { loginContentPaddingX } from '../utils/loginContentPadding';

export function LoginWelcomeHeader() {
  const { t } = useTranslation();
  const palette = useAppColors();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const { width: winW, height: winH } = useWindowDimensions();
  const isShort = winH < 580;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          alignItems: 'center',
          paddingHorizontal: loginContentPaddingX(winW),
          marginBottom: isShort ? 18 : 24,
        },
        heading: {
          marginTop: isShort ? 14 : 16,
          fontSize: winW < 340 ? 19 : winW < 380 ? 20 : 22,
          fontWeight: '800',
          color: palette.textPrimary,
          lineHeight: winW < 340 ? 25 : winW < 380 ? 27 : 30,
          textAlign: 'center',
        },
        subheading: {
          marginTop: 6,
          fontSize: 13,
          lineHeight: 18,
          color: palette.textSecondary,
          textAlign: 'center',
        },
      }),
    [palette.textPrimary, palette.textSecondary, winW, isShort],
  );

  return (
    <View style={styles.root}>
      <AppLogo
        variant={isDark ? 'dark' : 'default'}
        align="center"
        logoHeight={isShort ? 48 : 52}
        logoMaxWidth={220}
      />
      <Text style={styles.heading} accessibilityRole="header">
        {t('auth.welcomeTitle')}
      </Text>
      <Text style={styles.subheading}>{t('auth.welcomeSubtitle')}</Text>
    </View>
  );
}

export default LoginWelcomeHeader;
