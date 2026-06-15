import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordScreen } from '@/src/screens/forgotPassword/ForgotPasswordScreen';
import { LoginScreen } from '@/src/screens/login/LoginScreen';
import { RegisterScreen } from '@/src/screens/register/RegisterScreen';
import { SplashScreen } from '@/src/screens/splash/SplashScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { NotificationsScreen } from '@/src/screens/notifications/NotificationsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root stack: Splash auto-advances to Login. Header is hidden because both
 * screens are full-bleed. Reanimated handles in-screen motion; the stack
 * handles screen-to-screen transitions.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}
