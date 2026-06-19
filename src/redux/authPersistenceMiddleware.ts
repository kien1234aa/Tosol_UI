import type { Middleware } from '@reduxjs/toolkit';
import { computeTokenExpiresAt } from '@/src/helpers/api/session.helpers';
import { authSessionStorage, loginCredentialsStorage } from '@/src/storage';
import type { RootState } from './rootReducer';
import { logout } from './login/authSlice';
import {
  loginThunk,
  restoreSessionThunk,
  switchWarehouseThunk,
  fetchCurrentUserThunk,
} from './login/authThunks';

async function persistAuthenticatedSession(
  state: RootState['auth'],
): Promise<void> {
  if (state.status !== 'authenticated' || !state.user || !state.token) {
    return;
  }

  const tokenExpiresAt =
    state.tokenExpiresAt ??
    (state.expiresIn != null
      ? computeTokenExpiresAt(state.expiresIn)
      : null);

  if (tokenExpiresAt == null) {
    return;
  }

  await authSessionStorage.save(
    {
      user: state.user,
      token: state.token,
      tokenType: state.tokenType ?? 'Bearer',
      expiresIn: state.expiresIn ?? 0,
      tokenExpiresAt,
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

    if (loginThunk.fulfilled.match(action)) {
      const auth = store.getState().auth;
      const credentials = action.meta.arg;

      if (auth.rememberMe) {
        void persistAuthenticatedSession(auth);
        void loginCredentialsStorage.save({
          username: credentials.username,
          password: credentials.password,
          rememberMe: true,
        });
      } else {
        void authSessionStorage.clear();
        void loginCredentialsStorage.clear();
      }

      return result;
    }

    if (restoreSessionThunk.fulfilled.match(action)) {
      void persistAuthenticatedSession(store.getState().auth);
      return result;
    }

    if (
      fetchCurrentUserThunk.fulfilled.match(action) ||
      switchWarehouseThunk.fulfilled.match(action)
    ) {
      const auth = store.getState().auth;

      if (auth.rememberMe) {
        void persistAuthenticatedSession(auth);
      }
    }

    return result;
  };
