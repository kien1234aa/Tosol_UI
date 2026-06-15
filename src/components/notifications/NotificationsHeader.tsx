import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { notificationsCopy } from '@/src/configs/notifications';
import { buttonContentCenter, buttonLabelStyle } from '@/src/configs/theme/buttonLayout';
import { StackHeader, STACK_HEADER_BACK_SIZE } from '@/src/components/main';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';

interface NotificationsHeaderProps {
  unreadCount: number;
  onPressBack: () => void;
  onMarkAllRead: () => void;
}

function NotificationsHeaderComponent({
  unreadCount,
  onPressBack,
  onMarkAllRead,
}: NotificationsHeaderProps) {
  const canMarkAllRead = unreadCount > 0;

  return (
    <StackHeader
      title={notificationsCopy.title}
      onPressBack={onPressBack}
      backAccessibilityLabel={notificationsCopy.back}
      rightAction={
        <Pressable
          onPress={onMarkAllRead}
          disabled={!canMarkAllRead}
          accessibilityRole="button"
          accessibilityLabel={notificationsCopy.markAllRead}
          style={styles.actionButton}>
          <Text
            size="xs"
            className="text-center font-medium text-tertiary-600"
            style={[buttonLabelStyle, !canMarkAllRead && styles.disabledAction]}>
            {notificationsCopy.markAllRead}
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  actionButton: {
    minWidth: 72,
    minHeight: STACK_HEADER_BACK_SIZE,
    ...buttonContentCenter,
  },
  disabledAction: {
    opacity: 0.4,
  },
});

export const NotificationsHeader = memo(NotificationsHeaderComponent);
