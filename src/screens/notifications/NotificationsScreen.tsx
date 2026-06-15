import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NotificationListItem,
  NotificationSegmentedControl,
  NotificationsHeader,
} from '@/src/components/notifications';
import { useNotificationsList } from '@/src/hooks/notifications';
import type { RootStackScreenProps } from '@/src/navigation/types';
import type {
  AppNotification,
  NotificationFilter,
} from '@/src/types/notifications/notifications.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type NotificationsScreenProps = RootStackScreenProps<'Notifications'>;

export function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const {
    notifications,
    categoryUnreadCount,
    activeFilter,
    filterOptions,
    emptyMessage,
    onSelectFilter,
    onPressNotification,
    onMarkAllRead,
  } = useNotificationsList();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectFilter = useCallback(
    (filter: string) => {
      onSelectFilter(filter as NotificationFilter);
    },
    [onSelectFilter],
  );

  const renderItem = useCallback<ListRenderItem<AppNotification>>(
    ({ item }) => (
      <NotificationListItem
        notification={item}
        onPress={onPressNotification}
      />
    ),
    [onPressNotification],
  );

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <NotificationsHeader
          unreadCount={categoryUnreadCount}
          onPressBack={handleBack}
          onMarkAllRead={onMarkAllRead}
        />

        <VStack className="flex-1 px-4 pt-3" space="md">
          <NotificationSegmentedControl
            options={filterOptions}
            activeFilter={activeFilter}
            onSelectFilter={handleSelectFilter}
          />

          <FlatList
            data={notifications}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              notifications.length === 0 ? styles.emptyContent : styles.content
            }
            ItemSeparatorComponent={ListSeparator}
            ListEmptyComponent={
              <Center className="py-16">
                <Text size="md" className="text-center text-typography-500">
                  {emptyMessage}
                </Text>
              </Center>
            }
          />
        </VStack>
      </SafeAreaView>
    </Box>
  );
}

function ListSeparator() {
  return <Box style={styles.separator} />;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
  },
  separator: {
    height: 10,
  },
});
