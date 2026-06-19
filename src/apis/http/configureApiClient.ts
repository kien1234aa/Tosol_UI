import type { store as appStore } from '@/src/redux/store';
import { logout } from '@/src/redux/login/authSlice';
import {
  setAuthTokenGetter,
  setTokenExpiresAtGetter,
  setTokenRefreshHandler,
  setUnauthorizedHandler,
} from './httpClient';

type AppStore = typeof appStore;

/**
 * Wires the HTTP client to Redux auth state and session lifecycle handlers.
 * Call once during app bootstrap.
 */
export function configureApiClient(store: AppStore): void {
  setAuthTokenGetter(() => store.getState().auth.token);
  setTokenExpiresAtGetter(() => store.getState().auth.tokenExpiresAt);

  setUnauthorizedHandler(() => {
    store.dispatch(logout());
  });

  // Ready for backend refresh-token endpoint when available.
  setTokenRefreshHandler(async () => null);
}
