import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HomeActionKey, HomeBadges } from '@/src/types/home/home.types';

export interface HomeState {
  /** Notification badge counts keyed by dashboard action. */
  badges: HomeBadges;
}

const initialState: HomeState = {
  badges: {
    orderCart: 1,
  },
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setHomeBadge(
      state,
      action: PayloadAction<{ key: HomeActionKey; count: number }>,
    ) {
      state.badges[action.payload.key] = action.payload.count;
    },
    clearHomeBadge(state, action: PayloadAction<HomeActionKey>) {
      delete state.badges[action.payload];
    },
    resetHomeState() {
      return initialState;
    },
  },
});

export const { setHomeBadge, clearHomeBadge, resetHomeState } =
  homeSlice.actions;
export const homeReducer = homeSlice.reducer;
