import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { staffCopy, staffDetailCopy } from '@/src/configs/profile';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import {
  ProfileSectionCard,
  ProfileStackHeader,
  ProfileMenuRow,
  StaffChangePasswordModal,
  StaffDetailInfoRow,
  StaffDetailSummaryCard,
  StaffEditModal,
} from '@/src/components/profile';
import { useStaffDetail } from '@/src/hooks/profile';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { selectIsAdminUser } from '@/src/redux/login';
import {
  formatStaffDateTime,
  formatStaffLastLogin,
} from '@/src/helpers/profile/staff.helpers';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { DetailScreenSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type StaffDetailScreenProps = ProfileStackScreenProps<'StaffDetail'>;

export function StaffDetailScreen({
  navigation,
  route,
}: StaffDetailScreenProps) {
  const { staffUuid } = route.params;
  const isAdmin = useAppSelector(selectIsAdminUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const {
    staff,
    isLoading,
    isRefreshing,
    isSubmitting,
    loadError,
    reload,
    updateStaff,
    changePassword,
    toggleActive,
    deleteStaff,
  } = useStaffDetail(staffUuid, isAdmin);

  const handleBack = useStackGoBack(navigation, 'StaffList');

  useEffect(() => {
    if (!isAdmin) {
      navigation.goBack();
    }
  }, [isAdmin, navigation]);

  const handleSaveEdit = useCallback(
    async (payload: Parameters<typeof updateStaff>[0]) => {
      await updateStaff(payload);
      Alert.alert(staffDetailCopy.editSuccess);
    },
    [updateStaff],
  );

  const handleChangePassword = useCallback(
    async (payload: Parameters<typeof changePassword>[0]) => {
      await changePassword(payload);
      Alert.alert(staffDetailCopy.changePasswordSuccess);
    },
    [changePassword],
  );

  const handleToggleActive = useCallback(() => {
    if (!staff) {
      return;
    }

    const deactivating = staff.isActive;

    Alert.alert(
      deactivating
        ? staffDetailCopy.deactivateConfirmTitle
        : staffDetailCopy.activateConfirmTitle,
      deactivating
        ? `${staffDetailCopy.deactivateConfirmMessage}\n\n${staff.name}`
        : `${staffDetailCopy.activateConfirmMessage}\n\n${staff.name}`,
      [
        { text: staffDetailCopy.cancel, style: 'cancel' },
        {
          text: staffDetailCopy.confirm,
          style: deactivating ? 'destructive' : 'default',
          onPress: () => {
            void (async () => {
              try {
                await toggleActive();
                Alert.alert(
                  deactivating
                    ? staffDetailCopy.deactivateSuccess
                    : staffDetailCopy.activateSuccess,
                );
              } catch (error) {
                Alert.alert(
                  error instanceof Error
                    ? error.message
                    : staffDetailCopy.loadError,
                );
              }
            })();
          },
        },
      ],
    );
  }, [staff, toggleActive]);

  const handleDelete = useCallback(() => {
    if (!staff) {
      return;
    }

    Alert.alert(
      staffDetailCopy.deleteConfirmTitle,
      `${staffDetailCopy.deleteConfirmMessage}\n\n${staff.name}`,
      [
        { text: staffDetailCopy.cancel, style: 'cancel' },
        {
          text: staffDetailCopy.deleteAccount,
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteStaff();
                Alert.alert(staffDetailCopy.deleteSuccess, undefined, [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } catch (error) {
                Alert.alert(
                  error instanceof Error
                    ? error.message
                    : staffDetailCopy.loadError,
                );
              }
            })();
          },
        },
      ],
    );
  }, [deleteStaff, navigation, staff]);

  if (!isAdmin) {
    return null;
  }

  const renderBody = () => {
    if (isLoading && !staff) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <DetailScreenSkeleton style={styles.skeletonContent} />
        </ScrollView>
      );
    }

    if (!staff) {
      return (
        <Center className="flex-1 px-6">
          <Text size="sm" className="mb-4 text-center text-error-500">
            {loadError ?? staffDetailCopy.loadError}
          </Text>
          <Pressable onPress={reload} accessibilityRole="button">
            <Text size="sm" className="font-semibold text-tertiary-600">
              {staffDetailCopy.retry}
            </Text>
          </Pressable>
        </Center>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={reload}
            tintColor={lightTokens.tertiary600}
          />
        }>
        <VStack className="w-full" space="md">
          <StaffDetailSummaryCard staff={staff} />

          <ProfileSectionCard title={staffDetailCopy.accountSection}>
            <StaffDetailInfoRow
              label={staffDetailCopy.emailLabel}
              value={staff.email}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.phoneLabel}
              value={staff.phone || staffCopy.noPhone}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.roleLabel}
              value={staff.roleLabel}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.statusLabel}
              value={staff.isActive ? staffCopy.active : staffCopy.inactive}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.emailVerifiedLabel}
              value={
                staff.emailVerifiedAt
                  ? staffDetailCopy.emailVerified
                  : staffDetailCopy.emailUnverified
              }
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.lastLoginLabel}
              value={formatStaffLastLogin(staff.lastLoginAt)}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.createdAtLabel}
              value={formatStaffDateTime(staff.createdAt)}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.updatedAtLabel}
              value={formatStaffDateTime(staff.updatedAt)}
            />
          </ProfileSectionCard>

          <ProfileSectionCard title={staffDetailCopy.sellerSection}>
            <StaffDetailInfoRow
              label={staffDetailCopy.sellerNameLabel}
              value={staff.sellerName}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.sellerPhoneLabel}
              value={staff.sellerPhone || staffCopy.noPhone}
            />
            <StaffDetailInfoRow
              label={staffDetailCopy.warehouseCountLabel}
              value={String(staff.warehouseCount)}
            />
          </ProfileSectionCard>

          <ProfileSectionCard title={staffDetailCopy.actionsSection}>
            <ProfileMenuRow
              label={staffDetailCopy.editInfo}
              onPress={() => setIsEditOpen(true)}
            />
            <ProfileMenuRow
              label={staffDetailCopy.changePassword}
              onPress={() => setIsPasswordOpen(true)}
            />
            <ProfileMenuRow
              label={
                staff.isActive
                  ? staffDetailCopy.deactivate
                  : staffDetailCopy.activate
              }
              onPress={handleToggleActive}
              danger={staff.isActive}
              showChevron={false}
            />
            <ProfileMenuRow
              label={staffDetailCopy.deleteAccount}
              onPress={handleDelete}
              danger
              showChevron={false}
            />
          </ProfileSectionCard>
        </VStack>
      </ScrollView>
    );
  };

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <VStack className="flex-1">
          <ProfileStackHeader
            title={staffDetailCopy.screenTitle}
            onPressBack={handleBack}
          />
          {renderBody()}
        </VStack>

        {staff ? (
          <>
            <StaffEditModal
              visible={isEditOpen}
              initialName={staff.name}
              initialEmail={staff.email}
              initialPhone={staff.phone}
              initialRole={staff.role}
              isSubmitting={isSubmitting}
              onClose={() => setIsEditOpen(false)}
              onSave={handleSaveEdit}
            />
            <StaffChangePasswordModal
              visible={isPasswordOpen}
              isSubmitting={isSubmitting}
              onClose={() => setIsPasswordOpen(false)}
              onSubmit={handleChangePassword}
            />
          </>
        ) : null}
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
    paddingTop: 12,
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
  },
  skeletonContent: {
    paddingHorizontal: 0,
  },
});
