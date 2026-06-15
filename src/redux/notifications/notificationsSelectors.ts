import { createSelector } from '@reduxjs/toolkit';
import {
  countUnreadNotifications,
  filterNotifications,
} from '@/src/helpers/notifications';
import type { NotificationFilter } from '@/src/types/notifications/notifications.types';
import type { RootState } from '@/src/redux/rootReducer';

const selectNotificationsState = (state: RootState) => state.notifications;

export const selectNotificationItems = createSelector(
  selectNotificationsState,
  state => state.items,
);

export const selectUnreadNotificationCount = createSelector(
  selectNotificationItems,
  items => countUnreadNotifications(items),
);

export const selectFilteredNotifications = createSelector(
  [
    selectNotificationItems,
    (_state: RootState, filter: NotificationFilter) => filter,
  ],
  (items, filter) => filterNotifications(items, filter),
);
