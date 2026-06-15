import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RegisterStatus } from '@/src/types/register/register.types';
import { registerThunk } from './registerThunks';

export interface RegisterState {
  status: RegisterStatus;
  error: string | null;
}

const initialState: RegisterState = {
  status: 'idle',
  error: null,
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    clearRegisterError(state) {
      state.error = null;
    },
    resetRegisterState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(registerThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, state => {
        state.status = 'success';
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Đăng ký thất bại';
      });
  },
});

export const { clearRegisterError, resetRegisterState } = registerSlice.actions;
export const registerReducer = registerSlice.reducer;
