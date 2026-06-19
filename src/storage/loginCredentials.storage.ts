import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGIN_CREDENTIALS_STORAGE_KEY = '@tosol/login_credentials';

export interface StoredLoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

function isStoredLoginCredentials(
  value: unknown,
): value is StoredLoginCredentials {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const credentials = value as Partial<StoredLoginCredentials>;

  return (
    typeof credentials.username === 'string' &&
    typeof credentials.password === 'string' &&
    credentials.rememberMe === true
  );
}

export const loginCredentialsStorage = {
  async save(credentials: StoredLoginCredentials): Promise<void> {
    await AsyncStorage.setItem(
      LOGIN_CREDENTIALS_STORAGE_KEY,
      JSON.stringify(credentials),
    );
  },

  async load(): Promise<StoredLoginCredentials | null> {
    const raw = await AsyncStorage.getItem(LOGIN_CREDENTIALS_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!isStoredLoginCredentials(parsed)) {
        await AsyncStorage.removeItem(LOGIN_CREDENTIALS_STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      await AsyncStorage.removeItem(LOGIN_CREDENTIALS_STORAGE_KEY);
      return null;
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(LOGIN_CREDENTIALS_STORAGE_KEY);
  },
};
