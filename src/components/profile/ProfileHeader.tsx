import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Bell, User, Wallet } from 'lucide-react-native';
import { profileCopy } from '@/src/configs/profile';
import { formatVndPrice } from '@/src/helpers/createOrder';
import { lightTokens } from '@/src/configs/theme';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ProfileHeaderProps {
  displayName: string;
  email?: string;
  roleLabel?: string;
  sellerName?: string;
  balanceVnd: number;
  unreadCount?: number;
  onPressNotifications?: () => void;
}

function ProfileHeaderComponent({
  displayName,
  email,
  roleLabel,
  sellerName,
  balanceVnd,
  unreadCount = 0,
  onPressNotifications,
}: ProfileHeaderProps) {
  const { horizontalPadding, scale } = useResponsiveLayout();
  const avatarSize = scale(52);
  const iconButtonSize = scale(36);
  const badgeSize = scale(16);
  const subtitle = email || sellerName;

  return (
    <Box
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: scale(16),
        },
      ]}>
      <HStack className="w-full items-center justify-between">
        <HStack className="min-w-0 flex-1 items-center gap-3">
          <Center
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              },
            ]}>
            <User color={lightTokens.tertiary500} size={scale(26)} />
          </Center>

          <VStack className="min-w-0 flex-1" space="xs">
            <Text size="sm" className="text-typography-500">
              {profileCopy.greeting}
            </Text>
            <Text
              size="lg"
              className="font-bold text-typography-900"
              numberOfLines={1}>
              {displayName}
            </Text>
            {subtitle ? (
              <Text size="xs" className="text-typography-500" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            {roleLabel ? (
              <Box style={styles.roleBadge}>
                <Text size="2xs" className="font-medium text-tertiary-600">
                  {roleLabel}
                </Text>
              </Box>
            ) : null}
          </VStack>
        </HStack>

        <VStack className="items-end" space="sm">
          <Pressable
            onPress={onPressNotifications}
            accessibilityRole="button"
            accessibilityLabel={profileCopy.notifications}
            style={[
              styles.iconButton,
              {
                width: iconButtonSize,
                height: iconButtonSize,
                borderRadius: iconButtonSize / 2,
              },
            ]}>
            <Bell color={lightTokens.typography900} size={scale(20)} />
            {unreadCount > 0 ? (
              <Box
                style={[
                  styles.badge,
                  {
                    minWidth: badgeSize,
                    height: badgeSize,
                    borderRadius: badgeSize / 2,
                  },
                ]}>
                <Text size="2xs" className="font-bold text-typography-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </Box>
            ) : null}
          </Pressable>

          <HStack className="items-center gap-1">
            <Wallet color={lightTokens.tertiary600} size={scale(16)} />
            <Text size="xs" className="font-medium text-typography-900">
              {profileCopy.balancePrefix} {formatVndPrice(balanceVnd)}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTokens.tertiary50,
    borderBottomWidth: 1,
    borderBottomColor: lightTokens.outline100,
  },
  avatar: {
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.error500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: lightTokens.tertiary100,
  },
});

export const ProfileHeader = memo(ProfileHeaderComponent);
