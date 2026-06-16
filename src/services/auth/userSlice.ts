import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import { login, logout } from './authSlice';
import { getUserInfo } from './userAPI';
import type { UserInfo } from './userResponseTypes';

const userErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === 'string') {
        return m;
      }
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Co loi xay ra';
};

interface UserState {
  profile: UserInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

/** Đồng bộ profile từ GET `/me` (gọi sau login hoặc khi cần refresh). */
export const fetchUserInfo = createAsyncThunk<
  UserInfo,
  void,
  { rejectValue: string }
>('user/fetchUserInfo', async (_, { rejectWithValue }) => {
  try {
    return await getUserInfo();
  } catch (error: unknown) {
    return rejectWithValue(userErrorMessage(error));
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.profile = null;
        state.error = null;
      })
      .addCase(login.rejected, state => {
        state.profile = null;
      })
      .addCase(fetchUserInfo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserInfo.fulfilled,
        (state, action: PayloadAction<UserInfo>) => {
          state.loading = false;
          state.profile = action.payload;
        },
      )
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Khong the tai thong tin nguoi dung';
      })
      .addCase(logout.fulfilled, state => {
        state.profile = null;
        state.error = null;
        state.loading = false;
      })
      .addCase(logout.rejected, state => {
        state.profile = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
