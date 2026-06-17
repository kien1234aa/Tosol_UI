import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, AuthUser } from '@/src/types/login/auth.types';

const AUTH_SESSION_STORAGE_KEY = '@tosol/auth_session';

export interface StoredAuthSession {
  user: AuthUser;
  token: string;
  tokenType: string;
  expiresIn: number;
  rememberMe: boolean;
}

function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<StoredAuthSession>;

  return (
    typeof session.token === 'string' &&
    typeof session.tokenType === 'string' &&
    typeof session.expiresIn === 'number' &&
    typeof session.rememberMe === 'boolean' &&
    session.user != null &&
    typeof session.user === 'object'
  );
}

export const authSessionStorage = {
  async save(session: AuthSession, rememberMe: boolean): Promise<void> {
    const payload: StoredAuthSession = {
      user: session.user,
      token: session.token,
      tokenType: session.tokenType,
      expiresIn: session.expiresIn,
      rememberMe,
    };

    await AsyncStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify(payload),
    );
  },

  async load(): Promise<StoredAuthSession | null> {
    const raw = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!isStoredAuthSession(parsed)) {
        await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  },
};
