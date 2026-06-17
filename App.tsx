/**
 * @format
 */

import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { setAuthTokenGetter } from '@/src/apis/http';
import { GluestackUIProvider } from '@/src/uikits/gluestack-ui-provider';
import { RootNavigator } from '@/src/navigation';
import type { RootStackParamList } from '@/src/navigation/types';
import { store } from '@/src/redux';
import { lightTokens } from '@/src/configs/theme';
import {
  ensureFcmColdStartNotification,
  ensureFcmNotificationOpenedAppListener,
  ensureFcmTokenRefreshListener,
  flushPendingFcmNotificationOpen,
  ForegroundPushBannerHost,
  setNavigationRef,
} from '@/src/push';

function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    setAuthTokenGetter(() => store.getState().auth.token);
    ensureFcmTokenRefreshListener();
    ensureFcmNotificationOpenedAppListener();
    ensureFcmColdStartNotification();
  }, []);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <GluestackUIProvider mode="light">
            <StatusBar
              barStyle="dark-content"
              backgroundColor={lightTokens.background50}
            />
            <ForegroundPushBannerHost>
              <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                  setNavigationRef(navigationRef);
                  flushPendingFcmNotificationOpen();
                }}>
                <RootNavigator />
              </NavigationContainer>
            </ForegroundPushBannerHost>
          </GluestackUIProvider>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = { flex: { flex: 1 } } as const;

export default App;
