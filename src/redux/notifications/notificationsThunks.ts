import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsService } from '@/src/apis/notifications';
import {
  mapApiNotificationToAppNotification,
  mapApiNotificationsToAppNotifications,
} from '@/src/helpers/notifications';
import type { AppNotification } from '@/src/types/notifications/notifications.types';
import type { RootState } from '../rootReducer';

export interface FetchNotificationsPayload {
  page: number;
  append: boolean;
}

export interface FetchNotificationsResult {
  notifications: AppNotification[];
  currentPage: number;
  lastPage: number;
  total: number;
  append: boolean;
}

export const fetchNotificationsThunk = createAsyncThunk<
  FetchNotificationsResult,
  FetchNotificationsPayload,
  { rejectValue: string; state: RootState }
>(
  'notifications/fetchNotifications',
  async ({ page, append }, { rejectWithValue }) => {
    try {
      const { data, meta } = await notificationsService.list({ page });

      return {
        notifications: mapApiNotificationsToAppNotifications(data),
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        total: meta.total,
        append,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể tải danh sách thông báo';
      return rejectWithValue(message);
    }
  },
  {
    condition: ({ page, append }, { getState }) => {
      const { listStatus, currentPage, lastPage } = getState().notifications;

      if (listStatus === 'loading' || listStatus === 'loadingMore') {
        return false;
      }

      if (append && currentPage >= lastPage) {
        return false;
      }

      if (append && page !== currentPage + 1) {
        return false;
      }

      return true;
    },
  },
);

export const markNotificationReadThunk = createAsyncThunk<
  AppNotification,
  string,
  { rejectValue: string }
>('notifications/markRead', async (notificationId, { rejectWithValue }) => {
  try {
    const data = await notificationsService.markAsRead(notificationId);
    return mapApiNotificationToAppNotification(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể đánh dấu thông báo đã đọc';
    return rejectWithValue(message);
  }
});

export const markAllNotificationsReadThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await notificationsService.markAllAsRead();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể đánh dấu tất cả thông báo đã đọc';
    return rejectWithValue(message);
  }
});
