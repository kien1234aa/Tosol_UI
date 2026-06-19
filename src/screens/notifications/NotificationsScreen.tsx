import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NotificationListItem,
  NotificationSegmentedControl,
  NotificationsHeader,
} from '@/src/components/notifications';
import { notificationsCopy } from '@/src/configs/notifications';
import { lightTokens } from '@/src/configs/theme';
import { useNotificationsList } from '@/src/hooks/notifications';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { RootStackScreenProps } from '@/src/navigation/types';
import { ListLoadingGate } from '@/src/shared/components/ui/ListLoadingGate';
import {
  ListScreenSkeleton,
  NotificationListItemSkeleton,
} from '@/src/shared/components/ui/skeleton';
import type {
  AppNotification,
  NotificationFilter,
} from '@/src/types/notifications/notifications.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type NotificationsScreenProps = RootStackScreenProps<'Notifications'>;

export function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const {
    notifications,
    unreadCount,
    activeFilter,
    filterOptions,
    emptyMessage,
    isLoading,
    isLoadingMore,
    loadError,
    onSelectFilter,
    onPressNotification,
    onMarkAllRead,
    reloadNotifications,
    loadMoreNotifications,
  } = useNotificationsList();

  const handleBack = useStackGoBack(navigation, 'Main');

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

  const handleEndReached = useCallback(() => {
    loadMoreNotifications();
  }, [loadMoreNotifications]);

  const listEmptyComponent = useCallback(() => {
    if (loadError) {
      return (
        <Center className="px-4 py-16">
          <Text size="sm" className="mb-3 text-center text-error-500">
            {loadError}
          </Text>
          <Pressable
            onPress={reloadNotifications}
            accessibilityRole="button">
            <Text size="sm" className="font-semibold text-tertiary-600">
              {notificationsCopy.retry}
            </Text>
          </Pressable>
        </Center>
      );
    }

    return (
      <Center className="py-16">
        <Text size="md" className="text-center text-typography-500">
          {emptyMessage}
        </Text>
      </Center>
    );
  }, [emptyMessage, loadError, reloadNotifications]);

  const listFooterComponent = useCallback(() => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <Center className="py-4">
        <ActivityIndicator color={lightTokens.tertiary600} size="small" />
        <Text size="xs" className="mt-2 text-typography-500">
          {notificationsCopy.loadingMore}
        </Text>
      </Center>
    );
  }, [isLoadingMore]);

  const listSkeleton = useMemo(
    () => (
      <ListScreenSkeleton
        count={6}
        showSectionHeader={false}
        ItemSkeleton={NotificationListItemSkeleton}
      />
    ),
    [],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isLoading && notifications.length > 0}
        onRefresh={reloadNotifications}
        tintColor={lightTokens.tertiary600}
      />
    ),
    [isLoading, notifications.length, reloadNotifications],
  );

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <NotificationsHeader
          unreadCount={unreadCount}
          onPressBack={handleBack}
          onMarkAllRead={onMarkAllRead}
        />

        <VStack className="flex-1 px-4 pt-3" space="md">
          <NotificationSegmentedControl
            options={filterOptions}
            activeFilter={activeFilter}
            onSelectFilter={handleSelectFilter}
          />

          <ListLoadingGate
            loading={isLoading}
            refreshing={isLoading && notifications.length > 0}
            itemCount={notifications.length}
            options={{ canShowSkeleton: !loadError }}
            skeleton={listSkeleton}>
            <FlatList
              data={notifications}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                notifications.length === 0 ? styles.emptyContent : styles.content
              }
              ItemSeparatorComponent={ListSeparator}
              ListEmptyComponent={listEmptyComponent}
              ListFooterComponent={listFooterComponent}
              refreshControl={refreshControl}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
            />
          </ListLoadingGate>
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
