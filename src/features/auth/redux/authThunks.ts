import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/auth.service';
import type { AuthSession, LoginCredentials } from '../models/auth.model';

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
