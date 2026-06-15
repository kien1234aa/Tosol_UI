import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectAuthState = (state: RootState) => state.auth;

export const selectAuthStatus = createSelector(
  selectAuthState,
  auth => auth.status,
);

export const selectIsAuthenticating = createSelector(
  selectAuthState,
  auth => auth.status === 'loading',
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  auth => auth.status === 'authenticated',
);

export const selectAuthError = createSelector(
  selectAuthState,
  auth => auth.error,
);

export const selectRememberMe = createSelector(
  selectAuthState,
  auth => auth.rememberMe,
);

export const selectAuthUser = createSelector(
  selectAuthState,
  auth => auth.user,
);
