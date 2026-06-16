/**
 * @format
 */

import './global.css';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GluestackUIProvider } from '@/src/uikits/gluestack-ui-provider';
import { AppNavigator } from '@/src/navigation/AppNavigator';
import { persistor, store } from '@/src/app/store';
import { LocaleProvider } from '@/src/app/providers/LocaleContext';
import {
  ensureFcmColdStartNotification,
  ensureFcmNotificationOpenedAppListener,
} from '@features/push/fcmNotificationLinking';
import { ensureFcmTokenRefreshListener } from '@features/push/fcmSync';
import i18n from '@shared/i18n';
import { ThemeProvider } from '@shared/theme/ThemeContext';
import { AppFeedbackProvider } from '@shared/components/ui/appFeedback/AppFeedbackProvider';
import { ForegroundPushBannerHost } from '@features/push/ForegroundPushBannerHost';

function App() {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      void Ionicons.loadFont();
    }
  }, []);

  useEffect(() => {
    ensureFcmTokenRefreshListener();
    ensureFcmNotificationOpenedAppListener();
    ensureFcmColdStartNotification();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ThemeProvider>
              <GluestackUIProvider mode="light">
                <AppFeedbackProvider>
                  <ForegroundPushBannerHost>
                    <I18nextProvider i18n={i18n}>
                      <LocaleProvider>
                        <AppNavigator />
                      </LocaleProvider>
                    </I18nextProvider>
                  </ForegroundPushBannerHost>
                </AppFeedbackProvider>
              </GluestackUIProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
