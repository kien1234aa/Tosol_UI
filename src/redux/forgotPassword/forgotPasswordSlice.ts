import { createSlice } from '@reduxjs/toolkit';
import type { ForgotPasswordStatus } from '@/src/types/forgotPassword/forgotPassword.types';
import { forgotPasswordThunk } from './forgotPasswordThunks';

export interface ForgotPasswordState {
  status: ForgotPasswordStatus;
  error: string | null;
  successMessage: string | null;
}

const initialState: ForgotPasswordState = {
  status: 'idle',
  error: null,
  successMessage: null,
};

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    clearForgotPasswordError(state) {
      state.error = null;
    },
    resetForgotPasswordState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(forgotPasswordThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.status = 'success';
        state.error = null;
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Gửi yêu cầu thất bại';
      });
  },
});

export const { clearForgotPasswordError, resetForgotPasswordState } =
  forgotPasswordSlice.actions;
export const forgotPasswordReducer = forgotPasswordSlice.reducer;
