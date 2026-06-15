import { useCallback, useMemo, useState } from 'react';
import { notificationsCopy } from '@/src/configs/notifications';
import { countUnreadNotificationsByCategory } from '@/src/helpers/notifications';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  markCategoryNotificationsRead,
  markNotificationRead,
  selectFilteredNotifications,
  selectNotificationItems,
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
  onSelectFilter: (filter: NotificationFilter) => void;
  onPressNotification: (notificationId: string) => void;
  onMarkAllRead: () => void;
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

  const onSelectFilter = useCallback((filter: NotificationFilter) => {
    setActiveFilter(filter);
  }, []);

  const onPressNotification = useCallback(
    (notificationId: string) => {
      dispatch(markNotificationRead(notificationId));
    },
    [dispatch],
  );

  const onMarkAllRead = useCallback(() => {
    dispatch(markCategoryNotificationsRead(activeFilter));
  }, [activeFilter, dispatch]);

  return {
    notifications,
    unreadCount,
    categoryUnreadCount,
    activeFilter,
    filterOptions,
    emptyMessage,
    onSelectFilter,
    onPressNotification,
    onMarkAllRead,
  };
}
