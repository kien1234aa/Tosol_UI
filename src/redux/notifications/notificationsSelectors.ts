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

export const selectNotificationsListStatus = createSelector(
  selectNotificationsState,
  state => state.listStatus,
);

export const selectNotificationsListError = createSelector(
  selectNotificationsState,
  state => state.listError,
);

export const selectNotificationsCurrentPage = createSelector(
  selectNotificationsState,
  state => state.currentPage,
);

export const selectNotificationsLastPage = createSelector(
  selectNotificationsState,
  state => state.lastPage,
);

export const selectHasMoreNotifications = createSelector(
  [selectNotificationsCurrentPage, selectNotificationsLastPage],
  (currentPage, lastPage) => currentPage > 0 && currentPage < lastPage,
);

export const selectIsLoadingNotifications = createSelector(
  selectNotificationsListStatus,
  status => status === 'loading',
);

export const selectIsLoadingMoreNotifications = createSelector(
  selectNotificationsListStatus,
  status => status === 'loadingMore',
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
