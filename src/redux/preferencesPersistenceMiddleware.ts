import { isAnyOf, type Middleware, type MiddlewareAPI } from '@reduxjs/toolkit';
import { preferencesStorage } from '@/src/storage/preferences.storage';
import {
  hydratePreferencesState,
  recordPreference,
  recordPreferencesBatch,
  resetPreferencesState,
} from './preferences/preferencesSlice';
import { logout } from './login/authSlice';
import { loginThunk, restoreSessionThunk } from './login/authThunks';
import type { RootState } from './rootReducer';
import type { AppDispatch } from './store';

const preferenceMutationActions = isAnyOf(
  recordPreference,
  recordPreferencesBatch,
);

async function persistPreferencesForUser(
  userId: string,
  preferences: RootState['preferences'],
): Promise<void> {
  await preferencesStorage.save(userId, preferences);
}

async function restorePreferencesForUser(
  userId: string,
  store: MiddlewareAPI<AppDispatch, RootState>,
): Promise<void> {
  const storedPreferences = await preferencesStorage.load(userId);

  if (storedPreferences) {
    store.dispatch(hydratePreferencesState(storedPreferences));
    return;
  }

  store.dispatch(resetPreferencesState());
}

export const preferencesPersistenceMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const result = next(action);

    if (logout.match(action)) {
      store.dispatch(resetPreferencesState());
      return result;
    }

    if (
      loginThunk.fulfilled.match(action) ||
      restoreSessionThunk.fulfilled.match(action)
    ) {
      const userId = action.payload.user.id;
      void restorePreferencesForUser(userId, store);
      return result;
    }

    if (preferenceMutationActions(action)) {
      const { auth, preferences } = store.getState();
      const userId = auth.user?.id;

      if (auth.status === 'authenticated' && userId) {
        void persistPreferencesForUser(userId, preferences);
      }
    }

    return result;
  };
