import type { Middleware } from '@reduxjs/toolkit';
import { authSessionStorage } from '@/src/storage';
import type { RootState } from './rootReducer';
import {
  logout,
} from './login/authSlice';
import { loginThunk, restoreSessionThunk, switchWarehouseThunk, fetchCurrentUserThunk } from './login/authThunks';

async function persistAuthenticatedSession(state: RootState['auth']): Promise<void> {
  if (state.status !== 'authenticated' || !state.user || !state.token) {
    return;
  }

  await authSessionStorage.save(
    {
      user: state.user,
      token: state.token,
      tokenType: state.tokenType ?? 'Bearer',
      expiresIn: state.expiresIn ?? 0,
    },
    state.rememberMe,
  );
}

export const authPersistenceMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const result = next(action);

    if (logout.match(action)) {
      void authSessionStorage.clear();
      return result;
    }

    if (
      loginThunk.fulfilled.match(action) ||
      restoreSessionThunk.fulfilled.match(action) ||
      switchWarehouseThunk.fulfilled.match(action) ||
      fetchCurrentUserThunk.fulfilled.match(action)
    ) {
      void persistAuthenticatedSession(store.getState().auth);
    }

    return result;
  };
