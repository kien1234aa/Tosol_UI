import { useCallback, useEffect, useMemo, useState } from 'react';
import { notificationsCopy } from '@/src/configs/notifications';
import { countUnreadNotificationsByCategory } from '@/src/helpers/notifications';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { openNotificationPayload } from '@/src/push/notificationNavigation';
import {
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  selectFilteredNotifications,
  selectHasMoreNotifications,
  selectIsLoadingMoreNotifications,
  selectIsLoadingNotifications,
  selectNotificationItems,
  selectNotificationsCurrentPage,
  selectNotificationsListError,
  selectUnreadNotificationCount,
} from '@/src/redux/notifications';
import type {
  AppNotification,
  NotificationFilter,
} from '@/src/types/notifications/notifications.types';

export interface NotificationFilterOption {
  key: NotificationFilter;
  label: string;
}

export interface UseNotificationsListResult {
  notifications: AppNotification[];
  unreadCount: number;
  categoryUnreadCount: number;
  activeFilter: NotificationFilter;
  filterOptions: NotificationFilterOption[];
  emptyMessage: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadError: string | null;
  onSelectFilter: (filter: NotificationFilter) => void;
  onPressNotification: (notificationId: string) => void;
  onMarkAllRead: () => void;
  reloadNotifications: () => void;
  loadMoreNotifications: () => void;
}

export function useNotificationsList(): UseNotificationsListResult {
  const dispatch = useAppDispatch();
  const [activeFilter, setActiveFilter] =
    useState<NotificationFilter>('personal');
  const allItems = useAppSelector(selectNotificationItems);
  const notifications = useAppSelector(state =>
    selectFilteredNotifications(state, activeFilter),
  );
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const isLoading = useAppSelector(selectIsLoadingNotifications);
  const isLoadingMore = useAppSelector(selectIsLoadingMoreNotifications);
  const loadError = useAppSelector(selectNotificationsListError);
  const hasMore = useAppSelector(selectHasMoreNotifications);
  const currentPage = useAppSelector(selectNotificationsCurrentPage);

  const categoryUnreadCount = useMemo(
    () => countUnreadNotificationsByCategory(allItems, activeFilter),
    [activeFilter, allItems],
  );

  const filterOptions = useMemo<NotificationFilterOption[]>(
    () => [
      { key: 'personal', label: notificationsCopy.filterPersonal },
      { key: 'system', label: notificationsCopy.filterSystem },
    ],
    [],
  );

  const emptyMessage =
    activeFilter === 'system'
      ? notificationsCopy.emptySystem
      : notificationsCopy.emptyPersonal;

  const reloadNotifications = useCallback(() => {
    void dispatch(fetchNotificationsThunk({ page: 1, append: false }));
  }, [dispatch]);

  const loadMoreNotifications = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    void dispatch(
      fetchNotificationsThunk({
        page: currentPage + 1,
        append: true,
      }),
    );
  }, [currentPage, dispatch, hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
    reloadNotifications();
  }, [reloadNotifications]);

  const onSelectFilter = useCallback((filter: NotificationFilter) => {
    setActiveFilter(filter);
  }, []);

  const onPressNotification = useCallback(
    (notificationId: string) => {
      const notification = allItems.find(item => item.id === notificationId);

      if (notification == null) {
        return;
      }

      openNotificationPayload({
        notificationId: notification.id,
        actionUrl: notification.actionUrl,
      });
    },
    [allItems],
  );

  const onMarkAllRead = useCallback(() => {
    void dispatch(markAllNotificationsReadThunk());
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    categoryUnreadCount,
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
  };
}
