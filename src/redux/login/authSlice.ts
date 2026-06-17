import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, AuthStatus, AuthUser } from '@/src/types/login/auth.types';
import { loginThunk, restoreSessionThunk, switchWarehouseThunk, fetchCurrentUserThunk } from './authThunks';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  rememberMe: boolean;
  isSwitchingWarehouse: boolean;
  error: string | null;
}

const initialState: AuthState = {
  status: 'idle',
  user: null,
  token: null,
  tokenType: null,
  expiresIn: null,
  rememberMe: false,
  isSwitchingWarehouse: false,
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
    setCurrentWarehouseId(state, action: PayloadAction<number | null>) {
      if (state.user) {
        state.user.currentWarehouseId = action.payload;
      }
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
          state.tokenType = action.payload.tokenType;
          state.expiresIn = action.payload.expiresIn;
          state.error = null;
        },
      )
      .addCase(restoreSessionThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.tokenType = action.payload.tokenType;
        state.expiresIn = action.payload.expiresIn;
        state.rememberMe = action.payload.rememberMe;
        state.error = null;
      })
      .addCase(restoreSessionThunk.rejected, state => {
        state.status = 'idle';
        state.user = null;
        state.token = null;
        state.tokenType = null;
        state.expiresIn = null;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Đăng nhập thất bại';
      })
      .addCase(switchWarehouseThunk.pending, state => {
        state.isSwitchingWarehouse = true;
      })
      .addCase(switchWarehouseThunk.fulfilled, (state, action) => {
        state.isSwitchingWarehouse = false;

        if (!state.user) {
          return;
        }

        state.user.currentWarehouseId = action.payload.currentWarehouseId;

        const warehouse = action.payload.currentWarehouse;

        if (warehouse) {
          const index = state.user.warehouses.findIndex(
            item => item.id === warehouse.id,
          );

          if (index >= 0) {
            state.user.warehouses[index] = warehouse;
          }
        }
      })
      .addCase(switchWarehouseThunk.rejected, state => {
        state.isSwitchingWarehouse = false;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        if (state.status === 'authenticated') {
          state.user = action.payload;
        }
      });
  },
});

export const {
  setRememberMe,
  clearAuthError,
  setCurrentWarehouseId,
  logout,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
