import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/src/apis/login/auth.api';
import { warehouseService } from '@/src/apis/warehouse';
import { authSessionStorage } from '@/src/storage';
import type { AuthSession, AuthUser, LoginCredentials } from '@/src/types/login/auth.types';
import type { SwitchWarehouseResult } from '@/src/types/warehouse';
import type { StoredAuthSession } from '@/src/storage';
import { isSameWarehouseSelection } from '@/src/configs/warehouse';
import type { RootState } from '../rootReducer';

/**
 * AsyncThunk wrapping the auth service. Keeps side effects out of the slice
 * reducers and out of the UI layer.
 */
export const loginThunk = createAsyncThunk<
  AuthSession,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Đăng nhập thất bại';
    return rejectWithValue(message);
  }
});

export const restoreSessionThunk = createAsyncThunk<
  StoredAuthSession,
  void,
  { rejectValue: string }
>('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    const session = await authSessionStorage.load();

    if (!session) {
      return rejectWithValue('Không có phiên đăng nhập');
    }

    return session;
  } catch {
    return rejectWithValue('Không thể khôi phục phiên đăng nhập');
  }
});

export const fetchCurrentUserThunk = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string; state: RootState }
>('auth/fetchCurrentUser', async (_, { getState, rejectWithValue }) => {
  const { token, user } = getState().auth;

  if (!token) {
    return rejectWithValue('Chưa đăng nhập');
  }

  if (!user?.uuid) {
    return rejectWithValue('Không tìm thấy người dùng');
  }

  try {
    return await authService.getCurrentUser(user.uuid, {
      currentWarehouseId: user.currentWarehouseId,
      hasMultipleWarehouses: user.hasMultipleWarehouses,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Không thể tải thông tin người dùng';
    return rejectWithValue(message);
  }
});

export const switchWarehouseThunk = createAsyncThunk<
  SwitchWarehouseResult,
  number | null,
  { rejectValue: string; state: RootState }
>('auth/switchWarehouse', async (warehouseId, { getState, rejectWithValue }) => {
  const currentWarehouseId = getState().auth.user?.currentWarehouseId ?? null;

  if (isSameWarehouseSelection(currentWarehouseId, warehouseId)) {
    return {
      currentWarehouseId,
      currentWarehouse: null,
    };
  }

  try {
    return await warehouseService.switchContext(warehouseId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Chuyển kho thất bại';
    return rejectWithValue(message);
  }
});
