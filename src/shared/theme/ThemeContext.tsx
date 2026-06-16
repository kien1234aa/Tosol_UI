import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  darkPalette,
  lightPalette,
  type AppColorPalette,
  type ThemeMode,
} from './colorPalettes';

const STORAGE_KEY = '@tosol/theme_mode';

function bootstrapThemeMode(): ThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  /** Palette hiện tại (sáng hoặc tối). */
  colors: AppColorPalette;
  /** Đã đọc preference từ storage — splash / chrome dùng sau bước này. */
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(bootstrapThemeMode);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (raw === 'light' || raw === 'dark')) {
          setModeState(raw);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    void AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      void AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = (
    mode === 'light' ? lightPalette : darkPalette
  ) as AppColorPalette;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode,
      colors,
      hydrated,
    }),
    [mode, setMode, toggleMode, colors, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppColors(): AppColorPalette {
  const ctx = use(ThemeContext);
  if (!ctx) {
    return darkPalette;
  }
  return ctx.colors;
}

export function useThemeMode(): Pick<
  ThemeContextValue,
  'mode' | 'setMode' | 'toggleMode' | 'hydrated'
> {
  const ctx = use(ThemeContext);
  if (!ctx) {
    return {
      mode: bootstrapThemeMode(),
      setMode: () => {},
      toggleMode: () => {},
      hydrated: false,
    };
  }
  return {
    mode: ctx.mode,
    setMode: ctx.setMode,
    toggleMode: ctx.toggleMode,
    hydrated: ctx.hydrated,
  };
}
