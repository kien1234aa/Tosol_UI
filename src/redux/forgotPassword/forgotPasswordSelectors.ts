import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectForgotPasswordState = (state: RootState) => state.forgotPassword;

export const selectIsForgotPasswordSubmitting = createSelector(
  selectForgotPasswordState,
  forgotPassword => forgotPassword.status === 'loading',
);

export const selectForgotPasswordError = createSelector(
  selectForgotPasswordState,
  forgotPassword => forgotPassword.error,
);

export const selectIsForgotPasswordSuccess = createSelector(
  selectForgotPasswordState,
  forgotPassword => forgotPassword.status === 'success',
);
