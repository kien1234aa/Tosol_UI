import { configureStore } from '@reduxjs/toolkit';
import { authPersistenceMiddleware } from './authPersistenceMiddleware';
import { createOrderDraftPersistenceMiddleware } from './createOrderDraftPersistenceMiddleware';
import { preferencesPersistenceMiddleware } from './preferencesPersistenceMiddleware';
import { rootReducer, type RootState } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }).concat(
      authPersistenceMiddleware,
      createOrderDraftPersistenceMiddleware,
      preferencesPersistenceMiddleware,
    ),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type { RootState };
