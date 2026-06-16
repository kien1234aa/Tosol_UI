import { useCallback } from 'react';
import { Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

let hapticsUnavailable = false;

export function useTabHaptics() {
  const triggerTabHaptic = useCallback(() => {
    if (hapticsUnavailable) {
      return;
    }
    try {
      ReactNativeHapticFeedback.trigger(
        Platform.OS === 'ios' ? 'impactLight' : 'keyboardTap',
        HAPTIC_OPTIONS,
      );
    } catch {
      hapticsUnavailable = true;
    }
  }, []);

  return { triggerTabHaptic };
}
