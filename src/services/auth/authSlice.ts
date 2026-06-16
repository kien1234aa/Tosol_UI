import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import { syncApiClientAuthHeader } from '@shared/services/api';
import { loginRequest, logoutRequest } from './authAPI';
import type { LoginUser } from './loginResponseTypes';

const STORAGE_TOKEN_KEY = 'accessToken';
const STORAGE_USER_KEY = 'authUser';
const STORAGE_TOKEN_TYPE_KEY = 'authTokenType';
const STORAGE_EXPIRES_IN_KEY = 'authExpiresIn';
const STORAGE_SELECTED_WH_KEY = 'authSelectedWarehouseId';

interface AuthState {
  user: LoginUser | null;
  token: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  /** `null` = tat ca kho */
  selectedWarehouseId: number | null;
  isLoggedIn: boolean;
  loading: boolean;
  /** Dang xuat (nut menu / interceptor 401). */
  loggingOut: boolean;
  hydrated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  tokenType: null,
  expiresIn: null,
  selectedWarehouseId: null,
  isLoggedIn: false,
  loading: false,
  loggingOut: false,
  hydrated: false,
  error: null,
};

const persistSelectedWarehouseId = async (warehouseId: number | null) => {
  if (warehouseId != null) {
    await AsyncStorage.setItem(STORAGE_SELECTED_WH_KEY, String(warehouseId));
  } else {
    await AsyncStorage.removeItem(STORAGE_SELECTED_WH_KEY);
  }
};

const persistAuthSession = async (
  user: LoginUser | null,
  token: string | null,
  tokenType: string | null,
  expiresIn: number | null,
  selectedWarehouseId: number | null,
) => {
  if (token) {
    await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
  }

  if (user) {
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
  }

  if (tokenType) {
    await AsyncStorage.setItem(STORAGE_TOKEN_TYPE_KEY, tokenType);
  } else {
    await AsyncStorage.removeItem(STORAGE_TOKEN_TYPE_KEY);
  }

  if (expiresIn != null) {
    await AsyncStorage.setItem(STORAGE_EXPIRES_IN_KEY, String(expiresIn));
  } else {
    await AsyncStorage.removeItem(STORAGE_EXPIRES_IN_KEY);
  }

  await persistSelectedWarehouseId(selectedWarehouseId);
};

const authErrorMessage = (error: unknown): string => {
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
  return 'Login failed';
};

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const [token, serializedUser, tokenTypeRaw, expiresInRaw, whRaw] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
          AsyncStorage.getItem(STORAGE_USER_KEY),
          AsyncStorage.getItem(STORAGE_TOKEN_TYPE_KEY),
          AsyncStorage.getItem(STORAGE_EXPIRES_IN_KEY),
          AsyncStorage.getItem(STORAGE_SELECTED_WH_KEY),
        ]);

      let user: LoginUser | null = null;
      if (serializedUser) {
        try {
          user = JSON.parse(serializedUser) as LoginUser;
        } catch {
          user = null;
        }
      }

      const tokenType = tokenTypeRaw?.trim() || null;
      const expiresParsed = expiresInRaw != null ? Number(expiresInRaw) : NaN;
      const expiresIn = Number.isFinite(expiresParsed) ? expiresParsed : null;

      let selectedWarehouseId: number | null = null;
      if (whRaw != null) {
        const n = Number(whRaw);
        if (Number.isFinite(n)) {
          selectedWarehouseId = n;
        }
      }
      if (user && selectedWarehouseId != null) {
        const ok = user.warehouses.some(w => w.id === selectedWarehouseId);
        if (!ok) {
          selectedWarehouseId = null;
        }
      }

      syncApiClientAuthHeader(token);

      return { user, token, tokenType, expiresIn, selectedWarehouseId };
    } catch (error: unknown) {
      return rejectWithValue(authErrorMessage(error));
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (
    {
      email,
      password,
      remember,
    }: { email: string; password: string; remember: boolean },
    thunkAPI,
  ) => {
    try {
      const payload = await loginRequest(email, password, remember);

      if (!payload.success || !payload.data) {
        return thunkAPI.rejectWithValue(
          typeof payload.message === 'string'
            ? payload.message
            : 'Dang nhap that bai',
        );
      }

      const { user, token, token_type, expires_in } = payload.data;

      if (!token || !user) {
        return thunkAPI.rejectWithValue('Phan hoi dang nhap khong hop le');
      }

      if (!user.is_seller_user) {
        return thunkAPI.rejectWithValue(
          'Bạn không có quyền sử dụng ứng dụng này',
        );
      }

      const selectedWarehouseId =
        typeof user.current_warehouse_id === 'number'
          ? user.current_warehouse_id
          : null;
      const whValid =
        selectedWarehouseId != null &&
        user.warehouses.some(w => w.id === selectedWarehouseId);
      const initialWh = whValid ? selectedWarehouseId : null;

      await persistAuthSession(
        user,
        token,
        token_type ?? 'Bearer',
        expires_in ?? null,
        initialWh,
      );
      syncApiClientAuthHeader(token);

      return {
        user,
        token,
        tokenType: token_type ?? 'Bearer',
        expiresIn: expires_in ?? null,
        selectedWarehouseId: initialWh,
      };
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(authErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutRequest();
  } catch {
    // best-effort: van xoa session cuc bo
  }
  try {
    await persistAuthSession(null, null, null, null, null);
  } catch {
    // van tiep tuc xoa header
  }
  syncApiClientAuthHeader(null);
  return null;
});

export const setSelectedWarehouse = createAsyncThunk(
  'auth/setSelectedWarehouse',
  async (warehouseId: number | null) => {
    await persistSelectedWarehouseId(warehouseId);
    return warehouseId;
  },
);

type SessionPayload = {
  user: LoginUser | null;
  token: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  selectedWarehouseId: number | null;
};

const applySession = (state: AuthState, session: SessionPayload) => {
  state.user = session.user;
  state.token = session.token;
  state.tokenType = session.tokenType;
  state.expiresIn = session.expiresIn;
  state.selectedWarehouseId = session.selectedWarehouseId;
  state.isLoggedIn = Boolean(session.token);
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(restoreSession.pending, state => {
        state.loading = true;
      })
      .addCase(
        restoreSession.fulfilled,
        (state, action: PayloadAction<SessionPayload>) => {
          state.loading = false;
          state.hydrated = true;
          applySession(state, action.payload);
          state.error = null;
        },
      )
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Unable to restore session';
      })
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
        applySession(state, {
          user: null,
          token: null,
          tokenType: null,
          expiresIn: null,
          selectedWarehouseId: null,
        });
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<SessionPayload>) => {
          state.loading = false;
          state.hydrated = true;
          state.error = null;
          applySession(state, action.payload);
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Login failed';
        applySession(state, {
          user: null,
          token: null,
          tokenType: null,
          expiresIn: null,
          selectedWarehouseId: null,
        });
        syncApiClientAuthHeader(null);
      })
      .addCase(setSelectedWarehouse.fulfilled, (state, action) => {
        const id = action.payload;
        if (id == null) {
          state.selectedWarehouseId = null;
          return;
        }
        if (!state.user) {
          state.selectedWarehouseId = null;
          return;
        }
        const n = Number(id);
        const ok = state.user.warehouses.some(w => Number(w.id) === n);
        state.selectedWarehouseId = ok ? n : null;
      })
      .addCase(logout.pending, state => {
        state.loggingOut = true;
      })
      .addCase(logout.fulfilled, state => {
        applySession(state, {
          user: null,
          token: null,
          tokenType: null,
          expiresIn: null,
          selectedWarehouseId: null,
        });
        state.hydrated = true;
        state.loading = false;
        state.loggingOut = false;
      })
      .addCase(logout.rejected, state => {
        applySession(state, {
          user: null,
          token: null,
          tokenType: null,
          expiresIn: null,
          selectedWarehouseId: null,
        });
        state.hydrated = true;
        state.loading = false;
        state.loggingOut = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
