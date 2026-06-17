import { configureStore } from '@reduxjs/toolkit';
import { authPersistenceMiddleware } from './authPersistenceMiddleware';
import { cartPersistenceMiddleware } from './cartPersistenceMiddleware';
import { rootReducer, type RootState } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }).concat(authPersistenceMiddleware, cartPersistenceMiddleware),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type { RootState };
