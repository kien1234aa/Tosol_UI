import { createAsyncThunk } from '@reduxjs/toolkit';
import { forgotPasswordService } from '@/src/apis/forgotPassword/forgotPassword.api';
import { toApiFailurePayload } from '@/src/helpers/api/apiError.helpers';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResult,
} from '@/src/types/forgotPassword/forgotPassword.types';

export const forgotPasswordThunk = createAsyncThunk<
  ForgotPasswordResult,
  ForgotPasswordRequest,
  { rejectValue: string }
>('forgotPassword/submit', async (request, { rejectWithValue }) => {
  try {
    return await forgotPasswordService.requestReset(request);
  } catch (error) {
    return rejectWithValue(
      toApiFailurePayload(error, 'Gửi yêu cầu thất bại').message,
    );
  }
});
