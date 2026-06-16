import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileCopy } from '@/src/configs/profile';
import { mainLayout } from '@/src/configs/main';
import {
  ProfileDivider,
  ProfileHeader,
  ProfileLogoutButton,
  ProfileMenuRow,
  ProfileSectionCard,
  ProfileSupportCard,
} from '@/src/components/profile';
import { useProfile } from '@/src/hooks/profile';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectUnreadNotificationCount } from '@/src/redux/notifications';
import { useAppDispatch } from '@/src/hooks';
import { logout } from '@/src/redux/login/authSlice';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ProfileScreenProps = ProfileStackScreenProps<'ProfileMain'>;

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const rootNavigation = navigation.getParent()?.getParent();
  const dispatch = useAppDispatch();
  const { displayName, balanceVnd } = useProfile();
  const unreadNotificationCount = useAppSelector(selectUnreadNotificationCount);

  const showComingSoon = useCallback(() => {
    Alert.alert(profileCopy.featureComingSoon);
  }, []);

  const handlePersonalInfo = useCallback(() => {
    navigation.navigate('PersonalInfo');
  }, [navigation]);

  const handleChangePassword = useCallback(() => {
    navigation.navigate('ChangePassword');
  }, [navigation]);

  const handleNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    rootNavigation?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [dispatch, rootNavigation]);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ProfileHeader
          displayName={displayName}
          balanceVnd={balanceVnd}
          unreadCount={unreadNotificationCount}
          onPressNotifications={handleNotifications}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <VStack className="w-full" space="md">
            <ProfileSectionCard title={profileCopy.accountSection}>
              <ProfileMenuRow
                label={profileCopy.personalInfo}
                onPress={handlePersonalInfo}
              />
              <ProfileDivider />
              <ProfileMenuRow
                label={profileCopy.changePassword}
                onPress={handleChangePassword}
              />
              <ProfileDivider />
              <ProfileMenuRow
                label={profileCopy.deleteAccount}
                onPress={showComingSoon}
                danger
              />
            </ProfileSectionCard>

            <ProfileSectionCard title={profileCopy.deliverySection}>
              <ProfileMenuRow
                label={profileCopy.createDeliveryRequest}
                onPress={showComingSoon}
              />
              <ProfileDivider />
              <ProfileMenuRow
                label={profileCopy.deliveryRequestList}
                onPress={showComingSoon}
              />
            </ProfileSectionCard>

            <ProfileSupportCard />

            <Center className="px-2 py-2">
              <Text size="xs" className="text-center text-typography-500">
                {profileCopy.hotline}
              </Text>
            </Center>

            <ProfileLogoutButton onPress={handleLogout} />
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
});
