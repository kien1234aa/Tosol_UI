import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { animationConfig, lightTokens } from '@/src/configs/theme';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { restoreSessionThunk, fetchCurrentUserThunk } from '@/src/redux/login';
import { fetchNotificationsThunk } from '@/src/redux/notifications';
import { fetchOrderDashboardCountsThunk } from '@/src/redux/orders';
import { store } from '@/src/redux';
import { syncFcmTokenWithBackend } from '@/src/push';
import type { RootStackScreenProps } from '@/src/navigation/types';

const splashIllustration = require('@/assets/images/mascot_splash.png');

type SplashScreenProps = RootStackScreenProps<'Splash'>;

function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function SplashScreen({ navigation }: SplashScreenProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

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

        if (cancelled) {
          return;
        }

        if (!store.getState().auth.token) {
          navigation.replace('Login');
          return;
        }

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
            style={[
              styles.illustration,
              {
                width: screenWidth * 0.92,
                height: screenHeight * 0.52,
              },
            ]}
            resizeMode="contain"
          />
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
    maxWidth: 460,
  },
});
