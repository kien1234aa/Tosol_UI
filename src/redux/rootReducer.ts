import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './login/authSlice';

/**
 * Root reducer composes every feature slice. New features register their
 * reducer here, keeping the store configuration open for extension.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
