import { useCallback } from 'react';
import { Vibration, Platform } from 'react-native';

let hapticLib: { trigger: (type: string, options?: object) => void } | null =
  null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  hapticLib = require('react-native-haptic-feedback').default;
} catch {
  // Package not installed — fall back to Vibration API
}

/**
 * Haptic feedback nhẹ khi bấm tab.
 * Ưu tiên `react-native-haptic-feedback` nếu có; nếu không dùng Vibration fallback.
 */
export function useTabHaptics() {
  const triggerTabHaptic = useCallback(() => {
    if (hapticLib) {
      hapticLib.trigger('selection', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      return;
    }
    if (Platform.OS === 'android') {
      Vibration.vibrate(10);
    }
  }, []);

  return { triggerTabHaptic };
}
