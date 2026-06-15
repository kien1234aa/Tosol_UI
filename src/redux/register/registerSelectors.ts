import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectRegisterState = (state: RootState) => state.register;

export const selectIsRegistering = createSelector(
  selectRegisterState,
  register => register.status === 'loading',
);

export const selectRegisterError = createSelector(
  selectRegisterState,
  register => register.error,
);

export const selectIsRegisterSuccess = createSelector(
  selectRegisterState,
  register => register.status === 'success',
);
