import React, { useEffect } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { animationConfig, lightTokens } from '@/src/configs/theme';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { restoreSessionThunk, fetchCurrentUserThunk } from '@/src/redux/login';
import { fetchNotificationsThunk } from '@/src/redux/notifications';
import { fetchOrderDashboardCountsThunk } from '@/src/redux/orders';
import { syncFcmTokenWithBackend } from '@/src/push';
import type { RootStackScreenProps } from '@/src/navigation/types';

const logo = require('@/assets/images/logo.png');
const splashIllustration = require('@/assets/images/mascot_splash.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const LOGO_SIZE = 64;

type SplashScreenProps = RootStackScreenProps<'Splash'>;

function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function SplashScreen({ navigation }: SplashScreenProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const [restoreResult] = await Promise.all([
        dispatch(restoreSessionThunk()),
        wait(animationConfig.splashDuration),
      ]);

      if (cancelled) {
        return;
      }

      if (restoreSessionThunk.fulfilled.match(restoreResult)) {
        await Promise.all([
          dispatch(fetchCurrentUserThunk()),
          dispatch(fetchNotificationsThunk({ page: 1, append: false })),
          dispatch(fetchOrderDashboardCountsThunk()),
        ]);
        void syncFcmTokenWithBackend();
        navigation.replace('Main');
        return;
      }

      navigation.replace('Login');
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={lightTokens.background50}
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
    backgroundColor: lightTokens.background50,
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
    width: SCREEN_WIDTH * 0.92,
    height: SCREEN_HEIGHT * 0.52,
    maxWidth: 460,
  },
  logoRing: {
    marginTop: 36,
    width: LOGO_SIZE + 24,
    height: LOGO_SIZE + 24,
    borderRadius: (LOGO_SIZE + 24) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
