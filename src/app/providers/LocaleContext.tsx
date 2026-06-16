import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@shared/i18n';

const STORAGE_KEY = '@tosol/app_locale';

export type AppLocale = 'vi' | 'en' | 'ja';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('vi');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (raw === 'vi' || raw === 'en' || raw === 'ja')) {
          setLocaleState(raw);
          void i18n.changeLanguage(raw);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
    void i18n.changeLanguage(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useAppLocale(): LocaleContextValue {
  const ctx = use(LocaleContext);
  if (!ctx) {
    return { locale: 'vi', setLocale: () => {} };
  }
  return ctx;
}
