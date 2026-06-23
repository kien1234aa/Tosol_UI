import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/src/redux/rootReducer';

const selectCountersState = (state: RootState) => state.counters;

export { selectCountersState };

export const selectCountersStatus = createSelector(
  selectCountersState,
  state => state.status,
);

export const selectCountersUnreadNotifications = createSelector(
  selectCountersState,
  state => state.unreadNotifications,
);

export const selectCountersData = createSelector(
  selectCountersState,
  state => state.data,
);
