import { createSelector } from '@reduxjs/toolkit';
import { buildUserProfile } from '@/src/helpers/profile';
import type { RootState } from '@/src/redux/rootReducer';

const selectProfileState = (state: RootState) => state.profile;
const selectAuthUser = (state: RootState) => state.auth.user;

export const selectStoredUserProfile = createSelector(
  selectProfileState,
  state => state.userProfile,
);

export const selectUserProfile = createSelector(
  [selectStoredUserProfile, selectAuthUser],
  (storedProfile, authUser) => ({
    ...buildUserProfile(authUser),
    ...storedProfile,
    username: authUser?.username || storedProfile.username,
  }),
);
