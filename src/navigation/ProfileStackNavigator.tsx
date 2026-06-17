import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/src/screens/profile/ProfileScreen';
import { PersonalInfoScreen } from '@/src/screens/profile/PersonalInfoScreen';
import { ChangePasswordScreen } from '@/src/screens/profile/ChangePasswordScreen';
import { StaffListScreen } from '@/src/screens/profile/StaffListScreen';
import { StaffDetailScreen } from '@/src/screens/profile/StaffDetailScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/** Profile tab stack: profile home → personal info / change password. */
export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="StaffList" component={StaffListScreen} />
      <Stack.Screen name="StaffDetail" component={StaffDetailScreen} />
    </Stack.Navigator>
  );
}
