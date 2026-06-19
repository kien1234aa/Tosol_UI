import { createAsyncThunk } from '@reduxjs/toolkit';
import { registerService } from '@/src/apis/register/register.api';
import { toApiFailurePayload } from '@/src/helpers/api/apiError.helpers';
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
    return rejectWithValue(
      toApiFailurePayload(error, 'Đăng ký thất bại').message,
    );
  }
});
