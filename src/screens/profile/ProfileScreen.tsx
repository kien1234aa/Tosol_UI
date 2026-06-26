import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileCopy } from '@/src/configs/profile';
import { productsCopy } from '@/src/configs/products';
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
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectUnreadNotificationCount } from '@/src/redux/notifications';
import { useAppDispatch } from '@/src/hooks';
import { fetchCurrentUserThunk, logout, selectIsAdminUser } from '@/src/redux/login';
import { resetCountersState } from '@/src/redux/counters';
import { resetNotificationsState } from '@/src/redux/notifications';
import { resetProfileState } from '@/src/redux/profile';
import {
  getRootNavigation,
  navigateRootScreen,
} from '@/src/navigation/rootNavigation.helpers';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type ProfileScreenProps = ProfileStackScreenProps<'ProfileMain'>;

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const rootNavigation = getRootNavigation(navigation);
  const dispatch = useAppDispatch();
  const { displayName, email, roleLabel, sellerName, reload } = useProfile();
  const isAdmin = useAppSelector(selectIsAdminUser);
  const unreadNotificationCount = useAppSelector(selectUnreadNotificationCount);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { horizontalPadding, contentMaxWidth, isTablet } = useResponsiveLayout();

  useEffect(() => {
    void dispatch(fetchCurrentUserThunk());
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await reload();
    } finally {
      setIsRefreshing(false);
    }
  }, [reload]);

  const handlePersonalInfo = useCallback(() => {
    navigation.navigate('PersonalInfo');
  }, [navigation]);

  const handleStaffList = useCallback(() => {
    navigation.navigate('StaffList');
  }, [navigation]);

  const handleProductList = useCallback(() => {
    navigation.navigate('ProductList');
  }, [navigation]);

  const handleCreateProduct = useCallback(() => {
    navigation.navigate('CreateProduct');
  }, [navigation]);

  const handleNotifications = useCallback(() => {
    navigateRootScreen(navigation, 'Notifications');
  }, [navigation]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(resetProfileState());
    dispatch(resetNotificationsState());
    dispatch(resetCountersState());
    rootNavigation?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [dispatch, rootNavigation]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
    ),
    [handleRefresh, isRefreshing],
  );

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ProfileHeader
          displayName={displayName}
          email={email}
          roleLabel={roleLabel}
          sellerName={sellerName}
          unreadCount={unreadNotificationCount}
          onPressNotifications={handleNotifications}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: horizontalPadding,
              maxWidth: isTablet ? contentMaxWidth.screen : undefined,
              alignSelf: isTablet ? 'center' : undefined,
              width: isTablet ? '100%' : undefined,
            },
          ]}
          refreshControl={refreshControl}>
          <VStack className="w-full" space="md">
            <ProfileSectionCard title={profileCopy.accountSection}>
              <ProfileMenuRow
                label={profileCopy.personalInfo}
                onPress={handlePersonalInfo}
              />
            </ProfileSectionCard>

            {isAdmin ? (
              <ProfileSectionCard title={profileCopy.staffSection}>
                <ProfileMenuRow
                  label={profileCopy.staffList}
                  onPress={handleStaffList}
                />
              </ProfileSectionCard>
            ) : null}

            <ProfileSectionCard title={productsCopy.sectionTitle}>
              <ProfileMenuRow
                label={productsCopy.productList}
                onPress={handleProductList}
              />
              <ProfileDivider />
              <ProfileMenuRow
                label={productsCopy.createProduct}
                onPress={handleCreateProduct}
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
    paddingTop: 16,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
});
