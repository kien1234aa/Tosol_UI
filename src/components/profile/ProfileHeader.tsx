import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Bell, User, Wallet } from 'lucide-react-native';
import { profileCopy } from '@/src/configs/profile';
import { formatVndPrice } from '@/src/helpers/cart';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ProfileHeaderProps {
  displayName: string;
  balanceVnd: number;
  unreadCount?: number;
  onPressNotifications?: () => void;
}

const AVATAR_SIZE = 52;
const ACTION_ICON_SIZE = 20;
const USER_ICON_SIZE = 26;

function ProfileHeaderComponent({
  displayName,
  balanceVnd,
  unreadCount = 0,
  onPressNotifications,
}: ProfileHeaderProps) {
  return (
    <Box style={styles.container}>
      <HStack className="w-full items-center justify-between">
        <HStack className="min-w-0 flex-1 items-center gap-3">
          <Center style={styles.avatar}>
            <User color={lightTokens.tertiary500} size={USER_ICON_SIZE} />
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
          </VStack>
        </HStack>

        <VStack className="items-end" space="sm">
          <Pressable
            onPress={onPressNotifications}
            accessibilityRole="button"
            accessibilityLabel={profileCopy.notifications}
            style={styles.iconButton}>
            <Bell color={lightTokens.typography900} size={ACTION_ICON_SIZE} />
            {unreadCount > 0 ? (
              <Box style={styles.badge}>
                <Text size="2xs" className="font-bold text-typography-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </Box>
            ) : null}
          </Pressable>

          <HStack className="items-center gap-1">
            <Wallet color={lightTokens.tertiary600} size={16} />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.tertiary50,
    borderBottomWidth: 1,
    borderBottomColor: lightTokens.outline100,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.error500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
});

export const ProfileHeader = memo(ProfileHeaderComponent);
