/** User preference learning — persisted per user in Redux + AsyncStorage. */

export interface PreferenceEntry {
  id: string;
  label: string;
  subtitle?: string;
  meta?: Record<string, string>;
  useCount: number;
  lastUsedAt: number;
}

export interface PreferencesState {
  byKey: Record<string, PreferenceEntry[]>;
}

export interface RecordPreferencePayload {
  key: string;
  id: string | number;
  label: string;
  subtitle?: string;
  meta?: Record<string, string>;
  contextKey?: string;
  /** Extra weight for strong signals (e.g. order submit). Default 1. */
  boost?: number;
}
