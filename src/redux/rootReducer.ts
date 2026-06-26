import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './login/authSlice';
import { forgotPasswordReducer } from './forgotPassword/forgotPasswordSlice';
import { homeReducer } from './home/homeSlice';
import { searchReducer } from './search/searchSlice';
import { createOrderDraftReducer } from './createOrderDraft/createOrderDraftSlice';
import { ordersReducer } from './orders/ordersSlice';
import { profileReducer } from './profile/profileSlice';
import { notificationsReducer } from './notifications/notificationsSlice';
import { countersReducer } from './counters/countersSlice';
import { preferencesReducer } from './preferences/preferencesSlice';

/**
 * Root reducer composes every feature slice. New features register their
 * reducer here, keeping the store configuration open for extension.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
  forgotPassword: forgotPasswordReducer,
  home: homeReducer,
  search: searchReducer,
  createOrderDraft: createOrderDraftReducer,
  orders: ordersReducer,
  profile: profileReducer,
  notifications: notificationsReducer,
  counters: countersReducer,
  preferences: preferencesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
