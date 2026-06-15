import { createAsyncThunk } from '@reduxjs/toolkit';
import { registerService } from '@/src/apis/register/register.api';
import type {
  RegisterCredentials,
  RegisterResult,
} from '@/src/types/register/register.types';

export const registerThunk = createAsyncThunk<
  RegisterResult,
  RegisterCredentials,
  { rejectValue: string }
>('register/submit', async (credentials, { rejectWithValue }) => {
  try {
    return await registerService.register(credentials);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Đăng ký thất bại';
    return rejectWithValue(message);
  }
});
