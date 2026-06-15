import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mockUserProfile } from '@/src/configs/profile';
import type { UserProfile } from '@/src/types/profile/profile.types';

export interface ProfileState {
  userProfile: UserProfile;
}

const initialState: ProfileState = {
  userProfile: { ...mockUserProfile },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateUserProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      state.userProfile = {
        ...state.userProfile,
        ...action.payload,
      };
    },
    resetProfileState() {
      return initialState;
    },
  },
});

export const { updateUserProfile, resetProfileState } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
