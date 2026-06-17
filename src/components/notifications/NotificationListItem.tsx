import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import {
  Bell,
  ClipboardList,
  Truck,
  Wallet,
} from 'lucide-react-native';
import { notificationTypeLabels } from '@/src/configs/notifications';
import { formatNotificationTime } from '@/src/helpers/notifications';
import { lightTokens } from '@/src/configs/theme';
import type {
  AppNotification,
  NotificationType,
} from '@/src/types/notifications/notifications.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface NotificationListItemProps {
  notification: AppNotification;
  onPress: (notificationId: string) => void;
}

const TYPE_STYLES: Record<
  NotificationType,
  { backgroundColor: string; color: string; Icon: typeof Bell }
> = {
  order: {
    backgroundColor: lightTokens.tertiary100,
    color: lightTokens.tertiary600,
    Icon: ClipboardList,
  },
  payment: {
    backgroundColor: '#FFF4E5',
    color: '#B45309',
    Icon: Wallet,
  },
  delivery: {
    backgroundColor: '#E8F7EE',
    color: '#15803D',
    Icon: Truck,
  },
  system: {
    backgroundColor: lightTokens.background100,
    color: lightTokens.typography900,
    Icon: Bell,
  },
};

const ICON_SIZE = 18;

function NotificationListItemComponent({
  notification,
  onPress,
}: NotificationListItemProps) {
  const palette = TYPE_STYLES[notification.type];
  const Icon = palette.Icon;

  return (
    <Pressable
      onPress={() => onPress(notification.id)}
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      style={[
        styles.card,
        !notification.isRead ? styles.cardUnread : undefined,
      ]}>
      <HStack className="w-full items-start gap-3">
        <Center
          style={[
            styles.iconWrap,
            { backgroundColor: palette.backgroundColor },
          ]}>
          <Icon color={palette.color} size={ICON_SIZE} />
        </Center>

        <VStack className="min-w-0 flex-1" space="xs">
          <HStack className="w-full items-start justify-between gap-2">
            <Text
              size="sm"
              className={
                notification.isRead
                  ? 'flex-1 font-medium text-typography-900'
                  : 'flex-1 font-bold text-typography-900'
              }
              numberOfLines={2}>
              {notification.title}
            </Text>
            {!notification.isRead ? <Box style={styles.unreadDot} /> : null}
          </HStack>

          <Text size="xs" className="text-typography-500">
            {notification.typeLabel || notificationTypeLabels[notification.type]}
          </Text>

          <Text size="sm" className="text-typography-600" numberOfLines={3}>
            {notification.message}
          </Text>

          <Text size="xs" className="text-typography-500">
            {formatNotificationTime(notification.createdAt)}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  cardUnread: {
    borderColor: lightTokens.tertiary200,
    backgroundColor: lightTokens.tertiary50,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: lightTokens.tertiary500,
  },
});

export const NotificationListItem = memo(NotificationListItemComponent);
