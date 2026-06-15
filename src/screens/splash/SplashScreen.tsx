import React, { useEffect } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkColors, animationConfig } from '@/src/configs/theme';
import type { RootStackScreenProps } from '@/src/navigation/types';

const logo = require('@/assets/images/logo.png');
const splashIllustration = require('@/assets/images/splash-illustration.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOGO_SIZE = 64;

type SplashScreenProps = RootStackScreenProps<'Splash'>;

export function SplashScreen({ navigation }: SplashScreenProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, animationConfig.splashDuration);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={darkColors.splashCanvas}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 28),
          },
        ]}>
        <View style={styles.heroBlock}>
          <Image
            source={splashIllustration}
            style={styles.illustration}
            resizeMode="contain"
          />

          <View style={styles.logoRing}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.splashCanvas,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  heroBlock: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  illustration: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.46,
    maxWidth: 400,
  },
  logoRing: {
    marginTop: 36,
    width: LOGO_SIZE + 24,
    height: LOGO_SIZE + 24,
    borderRadius: (LOGO_SIZE + 24) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkColors.backgroundMuted,
    borderWidth: 1,
    borderColor: darkColors.outline200,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
