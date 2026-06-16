import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { fontStyle } from '@/src/configs/theme/fonts';
import { Bell } from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { homeCopy } from '@/src/configs/home';
import { lightTokens } from '@/src/configs/theme';

interface DashboardHeaderProps {
  name: string;
  unreadCount?: number;
  onPressAvatar?: () => void;
  onPressNotifications?: () => void;
}

const AVATAR_SIZE = 48;
const NOTIFICATION_SIZE = 40;
const BELL_ICON_SIZE = 20;

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function DashboardHeaderComponent({
  name,
  unreadCount = 0,
  onPressAvatar,
  onPressNotifications,
}: DashboardHeaderProps) {
  const initials = getInitials(name);

  return (
    <Box style={styles.container}>
      <HStack className="w-full items-center justify-between">
        <HStack className="min-w-0 flex-1 items-center gap-3">
          <Pressable
            onPress={onPressAvatar}
            accessibilityRole="button"
            accessibilityLabel="Hồ sơ">
            <Center style={styles.avatar}>
              <Text
                size="sm"
                className="font-bold text-typography-0"
                style={styles.avatarText}>
                {initials}
              </Text>
            </Center>
          </Pressable>

          <VStack className="min-w-0 flex-1" space="xs">
            <Text size="sm" className="text-typography-500">
              {homeCopy.greeting}
            </Text>
            <Text
              size="lg"
              className="font-bold text-typography-900"
              numberOfLines={1}
              style={styles.name}>
              {name}
            </Text>
          </VStack>
        </HStack>

        <Pressable
          onPress={onPressNotifications}
          accessibilityRole="button"
          accessibilityLabel="Thông báo"
          style={styles.notificationButton}>
          <Bell color={lightTokens.typography900} size={BELL_ICON_SIZE} />
          {unreadCount > 0 ? (
            <Box style={styles.badge}>
              <Text size="2xs" className="font-bold text-typography-0">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </Box>
          ) : null}
        </Pressable>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: lightTokens.tertiary500,
    borderWidth: 2,
    borderColor: lightTokens.background0,
  },
  avatarText: {
    letterSpacing: 0.5,
  },
  name: fontStyle('semibold'),
  notificationButton: {
    width: NOTIFICATION_SIZE,
    height: NOTIFICATION_SIZE,
    borderRadius: NOTIFICATION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.error500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
});

export const DashboardHeader = memo(DashboardHeaderComponent);
