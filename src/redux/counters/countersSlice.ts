import { createSlice } from '@reduxjs/toolkit';
import {
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
} from '@/src/redux/notifications/notificationsThunks';
import type { CountersData } from '@/src/types/counters/counters.types';
import { fetchCountersThunk } from './countersThunks';

export type CountersStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CountersState {
  data: CountersData | null;
  unreadNotifications: number;
  status: CountersStatus;
  error: string | null;
  fetchedAt: number | null;
}

const initialState: CountersState = {
  data: null,
  unreadNotifications: 0,
  status: 'idle',
  error: null,
  fetchedAt: null,
};

const countersSlice = createSlice({
  name: 'counters',
  initialState,
  reducers: {
    resetCountersState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCountersThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCountersThunk.fulfilled, (state, action) => {
        state.status = 'success';
        state.data = action.payload;
        state.unreadNotifications = action.payload.user.unread_notifications;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchCountersThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Không thể tải số lượng thông báo';
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        if (!action.payload.isRead || state.unreadNotifications <= 0) {
          return;
        }

        state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);

        if (state.data) {
          state.data.user.unread_notifications = state.unreadNotifications;
        }
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, state => {
        state.unreadNotifications = 0;

        if (state.data) {
          state.data.user.unread_notifications = 0;
        }
      });
  },
});

export const { resetCountersState } = countersSlice.actions;
export const countersReducer = countersSlice.reducer;
