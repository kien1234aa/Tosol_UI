import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectHomeState = (state: RootState) => state.home;

export const selectHomeBadges = createSelector(
  selectHomeState,
  home => home.badges,
);
