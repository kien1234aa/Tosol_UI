import { configureStore } from '@reduxjs/toolkit';
import { rootReducer, type RootState } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type { RootState };
