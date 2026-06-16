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
import { LocaleProvider } from './providers/LocaleContext';
import { persistor, store } from './store';
import {
  ensureFcmColdStartNotification,
  ensureFcmNotificationOpenedAppListener,
} from '@features/push/fcmNotificationLinking';
import { ensureFcmTokenRefreshListener } from '@features/push/fcmSync';
import i18n from '@shared/i18n';
import { AppNavigator } from '@navigation/AppNavigator';
import { ThemeProvider } from '@shared/theme/ThemeContext';
import { AppFeedbackProvider } from '@shared/components/ui/appFeedback/AppFeedbackProvider';
import { ForegroundPushBannerHost } from '@features/push/ForegroundPushBannerHost';

export type { RootStackParamList } from '@navigation/AppNavigator';

export default function App() {
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
              <AppFeedbackProvider>
                <ForegroundPushBannerHost>
                  <I18nextProvider i18n={i18n}>
                    <LocaleProvider>
                      <AppNavigator />
                    </LocaleProvider>
                  </I18nextProvider>
                </ForegroundPushBannerHost>
              </AppFeedbackProvider>
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
