import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  buildPreferenceStorageKey,
  maxPreferenceEntries,
} from '@/src/configs/preferences/preferences.constants';
import type {
  PreferenceEntry,
  PreferencesState,
  RecordPreferencePayload,
} from '@/src/types/preferences/preferences.types';

const initialState: PreferencesState = {
  byKey: {},
};

function upsertPreferenceEntry(
  entries: PreferenceEntry[],
  payload: RecordPreferencePayload,
): PreferenceEntry[] {
  const now = Date.now();
  const id = String(payload.id);
  const boost = payload.boost ?? 1;
  const existingIndex = entries.findIndex(entry => entry.id === id);

  let nextEntry: PreferenceEntry;

  if (existingIndex >= 0) {
    const existing = entries[existingIndex];
    nextEntry = {
      ...existing,
      label: payload.label || existing.label,
      subtitle: payload.subtitle ?? existing.subtitle,
      meta: payload.meta ?? existing.meta,
      useCount: existing.useCount + boost,
      lastUsedAt: now,
    };
  } else {
    nextEntry = {
      id,
      label: payload.label,
      subtitle: payload.subtitle,
      meta: payload.meta,
      useCount: boost,
      lastUsedAt: now,
    };
  }

  const withoutExisting = entries.filter(entry => entry.id !== id);
  const next = [nextEntry, ...withoutExisting]
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, maxPreferenceEntries);

  return next;
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    recordPreference(state, action: PayloadAction<RecordPreferencePayload>) {
      const storageKey = buildPreferenceStorageKey(
        action.payload.key,
        action.payload.contextKey,
      );
      const current = state.byKey[storageKey] ?? [];
      state.byKey[storageKey] = upsertPreferenceEntry(current, action.payload);
    },
    recordPreferencesBatch(
      state,
      action: PayloadAction<RecordPreferencePayload[]>,
    ) {
      for (const payload of action.payload) {
        const storageKey = buildPreferenceStorageKey(
          payload.key,
          payload.contextKey,
        );
        const current = state.byKey[storageKey] ?? [];
        state.byKey[storageKey] = upsertPreferenceEntry(current, payload);
      }
    },
    hydratePreferencesState(state, action: PayloadAction<PreferencesState>) {
      state.byKey = action.payload.byKey;
    },
    resetPreferencesState() {
      return initialState;
    },
  },
});

export const {
  recordPreference,
  recordPreferencesBatch,
  hydratePreferencesState,
  resetPreferencesState,
} = preferencesSlice.actions;

export const preferencesReducer = preferencesSlice.reducer;
