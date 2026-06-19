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
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';

interface DashboardHeaderProps {
  name: string;
  unreadCount?: number;
  onPressAvatar?: () => void;
  onPressNotifications?: () => void;
}

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
  const { scale } = useResponsiveLayout();
  const avatarSize = scale(48);
  const notificationSize = scale(40);
  const bellIconSize = scale(20);
  const badgeSize = scale(18);
  const initials = getInitials(name);

  return (
    <Box
      style={[
        styles.container,
        {
          borderRadius: scale(16),
          paddingHorizontal: scale(16),
          paddingVertical: scale(14),
        },
      ]}>
      <HStack className="w-full items-center justify-between">
        <HStack className="min-w-0 flex-1 items-center gap-3">
          <Pressable
            onPress={onPressAvatar}
            accessibilityRole="button"
            accessibilityLabel="Hồ sơ">
            <Center
              style={[
                styles.avatar,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}>
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
          style={[
            styles.notificationButton,
            {
              width: notificationSize,
              height: notificationSize,
              borderRadius: notificationSize / 2,
              marginLeft: scale(12),
            },
          ]}>
          <Bell color={lightTokens.typography900} size={bellIconSize} />
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
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  avatar: {
    backgroundColor: lightTokens.tertiary500,
    borderWidth: 2,
    borderColor: lightTokens.background0,
  },
  avatarText: {
    letterSpacing: 0.5,
  },
  name: fontStyle('semibold'),
  notificationButton: {
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
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.error500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
});

export const DashboardHeader = memo(DashboardHeaderComponent);
