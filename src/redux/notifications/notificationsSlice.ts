import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mockNotifications } from '@/src/configs/notifications';
import type {
  AppNotification,
  NotificationCategory,
} from '@/src/types/notifications/notifications.types';

export interface NotificationsState {
  items: AppNotification[];
}

const initialState: NotificationsState = {
  items: mockNotifications,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllNotificationsRead(state) {
      state.items.forEach(item => {
        item.isRead = true;
      });
    },
    markCategoryNotificationsRead(
      state,
      action: PayloadAction<NotificationCategory>,
    ) {
      state.items.forEach(item => {
        if (item.category === action.payload) {
          item.isRead = true;
        }
      });
    },
    resetNotificationsState() {
      return initialState;
    },
  },
});

export const {
  markNotificationRead,
  markAllNotificationsRead,
  markCategoryNotificationsRead,
  resetNotificationsState,
} = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
