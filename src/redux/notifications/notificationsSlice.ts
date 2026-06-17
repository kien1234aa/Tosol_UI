import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  AppNotification,
  NotificationCategory,
} from '@/src/types/notifications/notifications.types';
import { fetchNotificationsThunk, markAllNotificationsReadThunk, markNotificationReadThunk } from './notificationsThunks';

export type NotificationsListStatus =
  | 'idle'
  | 'loading'
  | 'loadingMore'
  | 'success'
  | 'error';

export interface NotificationsState {
  items: AppNotification[];
  listStatus: NotificationsListStatus;
  listError: string | null;
  currentPage: number;
  lastPage: number;
  total: number;
}

const initialState: NotificationsState = {
  items: [],
  listStatus: 'idle',
  listError: null,
  currentPage: 0,
  lastPage: 0,
  total: 0,
};

function resetListPagination(state: NotificationsState): void {
  state.items = [];
  state.currentPage = 0;
  state.lastPage = 0;
  state.total = 0;
  state.listError = null;
  state.listStatus = 'idle';
}

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
  extraReducers: builder => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state, action) => {
        state.listError = null;
        state.listStatus = action.meta.arg.append ? 'loadingMore' : 'loading';
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.listStatus = 'success';
        state.currentPage = action.payload.currentPage;
        state.lastPage = action.payload.lastPage;
        state.total = action.payload.total;

        if (action.payload.append) {
          state.items = [...state.items, ...action.payload.notifications];
        } else {
          state.items = action.payload.notifications;
        }
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.listStatus = 'error';
        state.listError =
          action.payload ?? 'Không thể tải danh sách thông báo';
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          item => item.id === action.payload.id,
        );

        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, state => {
        state.items.forEach(item => {
          item.isRead = true;
        });
      });
  },
});

export const {
  markNotificationRead,
  markAllNotificationsRead,
  markCategoryNotificationsRead,
  resetNotificationsState,
} = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
