import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { BRAND_HEX } from '../../theme/designTokens';
import { resolveSplashTheme } from '../../theme/splashTheme';
import { useAppColors, useThemeMode } from '../../theme/ThemeContext';

const LOGO = require('@assets/images/logo-template.png');
const LOGO_SIZE = 100;

/** Overlay khi Redux / theme chưa sẵn sàng — nền theo light/dark mode app. */
export function BootSplashBrandedView() {
  const colors = useAppColors();
  const { mode } = useThemeMode();
  const splash = useMemo(
    () => resolveSplashTheme(mode, colors),
    [mode, colors],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: splash.background,
        },
        logo: {
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          marginBottom: 28,
          tintColor: BRAND_HEX,
        },
        spinner: {
          marginTop: 0,
        },
      }),
    [splash.background],
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={splash.statusBarStyle}
        backgroundColor={splash.background}
      />
      <Image
        source={LOGO}
        style={styles.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="TOSOL"
      />
      <ActivityIndicator
        style={styles.spinner}
        color={splash.spinner}
        size="large"
      />
    </View>
  );
}
