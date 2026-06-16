import React, { useMemo, useRef } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';
import { useAppSelector } from '@app/hooks';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { buildSalesNavigationTheme } from '@shared/theme/navigationTheme';
import { BootSplashBrandedView } from '@shared/components/bootsplash/BootSplashBrandedView';
import SalesLayout from '@features/sales/screens/SalesLayout';
import { SellerLoginScreen } from '@/src/screens/login/SellerLoginScreen';
import { rootNavigationRef } from './rootNavigationRef';
import {
  useSessionRestore,
  useUserInfoSync,
  useCountersPolling,
  useFcmSync,
  useApiUnauthorizedHandler,
} from './hooks';

export type RootStackParamList = {
  Login: undefined;
  Sales: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
  rootFlex: { flex: 1 },
});

export function AppNavigator() {
  const { hydrated, isLoggedIn, user } = useAppSelector(state => state.auth);
  const colors = useAppColors();
  const { mode, hydrated: themeHydrated } = useThemeMode();
  const rootNavTheme = useMemo(
    () => buildSalesNavigationTheme(mode, colors),
    [mode, colors],
  );

  useSessionRestore();
  useUserInfoSync();
  useCountersPolling();
  useFcmSync();
  useApiUnauthorizedHandler();

  const bootSplashHiddenRef = useRef(false);

  if (!hydrated || !themeHydrated) {
    return <BootSplashBrandedView />;
  }

  const statusBarBg = isLoggedIn ? colors.bgHeaderBar : colors.bgDeep;
  const statusBarStyle =
    isLoggedIn && mode === 'light'
      ? 'dark-content'
      : isLoggedIn
        ? 'light-content'
        : mode === 'light'
          ? 'dark-content'
          : 'light-content';

  return (
    <View style={[styles.rootFlex, { backgroundColor: colors.bg }]}>
      <NavigationContainer
        ref={rootNavigationRef}
        theme={rootNavTheme}
        onReady={() => {
          if (bootSplashHiddenRef.current) {
            return;
          }
          bootSplashHiddenRef.current = true;
          requestAnimationFrame(() => {
            void BootSplash.hide({ fade: false });
          });
        }}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBg} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}>
          {isLoggedIn ? (
            <Stack.Screen
              name="Sales"
              component={SalesLayout}
              key={user?.uuid ?? 'sales-anonymous'}
            />
          ) : (
            <Stack.Screen name="Login" component={SellerLoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
