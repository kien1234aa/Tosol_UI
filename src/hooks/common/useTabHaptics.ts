import { useCallback } from 'react';
import { Platform, Vibration } from 'react-native';

type HapticOptions = {
  enableVibrateFallback?: boolean;
  ignoreAndroidSystemSettings?: boolean;
};

type HapticTrigger = (type: string, options?: HapticOptions) => void;

let cachedTrigger: HapticTrigger | null = null;
let resolved = false;

function resolveHapticTrigger(): HapticTrigger | null {
  if (resolved) {
    return cachedTrigger;
  }
  resolved = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-haptic-feedback');
    const candidate = (mod?.default ?? mod) as { trigger?: HapticTrigger };
    cachedTrigger = typeof candidate.trigger === 'function' ? candidate.trigger : null;
  } catch {
    cachedTrigger = null;
  }

  return cachedTrigger;
}

/** Light selection feedback for bottom-tab presses, with a Vibration fallback. */
export function useTabHaptics() {
  const triggerTabHaptic = useCallback(() => {
    const trigger = resolveHapticTrigger();

    if (trigger) {
      trigger('selection', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      return;
    }

    if (Platform.OS === 'android') {
      try {
        Vibration.vibrate(10);
      } catch {
        // Missing android.permission.VIBRATE — silently skip feedback.
      }
    }
  }, []);

  return { triggerTabHaptic };
}
