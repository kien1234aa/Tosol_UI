import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, AuthStatus, AuthUser } from '@/src/types/login/auth.types';
import { loginThunk } from './authThunks';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  rememberMe: boolean;
  error: string | null;
}

const initialState: AuthState = {
  status: 'idle',
  user: null,
  token: null,
  rememberMe: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRememberMe(state, action: PayloadAction<boolean>) {
      state.rememberMe = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    logout() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<AuthSession>) => {
          state.status = 'authenticated';
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.error = null;
        },
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Đăng nhập thất bại';
      });
  },
});

export const { setRememberMe, clearAuthError, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
