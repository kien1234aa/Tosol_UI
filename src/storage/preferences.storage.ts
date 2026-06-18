import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PreferencesState } from '@/src/types/preferences/preferences.types';
import type { PreferenceEntry } from '@/src/types/preferences/preferences.types';

const preferencesStorageKeyPrefix = '@tosol/preferences/';

function getPreferencesStorageKey(userId: string): string {
  return `${preferencesStorageKeyPrefix}${userId}`;
}

function isPreferenceEntry(value: unknown): value is PreferenceEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<PreferenceEntry>;

  return (
    typeof entry.id === 'string' &&
    typeof entry.label === 'string' &&
    typeof entry.useCount === 'number' &&
    typeof entry.lastUsedAt === 'number'
  );
}

function isPreferencesState(value: unknown): value is PreferencesState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as Partial<PreferencesState>;

  if (!state.byKey || typeof state.byKey !== 'object') {
    return false;
  }

  return Object.values(state.byKey).every(
    bucket => Array.isArray(bucket) && bucket.every(isPreferenceEntry),
  );
}

export const preferencesStorage = {
  async save(userId: string, preferences: PreferencesState): Promise<void> {
    await AsyncStorage.setItem(
      getPreferencesStorageKey(userId),
      JSON.stringify(preferences),
    );
  },

  async load(userId: string): Promise<PreferencesState | null> {
    const raw = await AsyncStorage.getItem(getPreferencesStorageKey(userId));

    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!isPreferencesState(parsed)) {
        await AsyncStorage.removeItem(getPreferencesStorageKey(userId));
        return null;
      }

      return parsed;
    } catch {
      await AsyncStorage.removeItem(getPreferencesStorageKey(userId));
      return null;
    }
  },

  async clear(userId: string): Promise<void> {
    await AsyncStorage.removeItem(getPreferencesStorageKey(userId));
  },
};
