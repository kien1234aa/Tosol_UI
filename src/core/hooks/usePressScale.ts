import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { animationConfig } from '@/src/core/theme';

/**
 * Reusable press feedback: returns an animated style plus press handlers
 * that spring a node between full size and `pressScale`. Runs on the UI
 * thread via Reanimated so it never blocks JS.
 */
export function usePressScale() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(
      animationConfig.pressScale,
      animationConfig.pressSpring,
    );
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, animationConfig.pressSpring);
  }, [scale]);

  return { animatedStyle, onPressIn, onPressOut };
}
