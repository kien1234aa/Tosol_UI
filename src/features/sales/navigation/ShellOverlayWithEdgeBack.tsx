import React, { useCallback, useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/** Vùng cạnh trái (pt) — đồng bộ interactive pop của iOS. */
const EDGE_ACTIVATION_WIDTH = 22;
const DISMISS_WIDTH_RATIO = 0.33;
const DISMISS_VELOCITY = 650;

export type ShellOverlayWithEdgeBackProps = {
  children: React.ReactNode;
  onBack: () => void;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  /** Tắt khi overlay pass-through (stack con đang nhận touch). */
  edgeBackEnabled?: boolean;
};

/**
 * Bọc các overlay full-screen của Sales shell — vuốt từ cạnh trái (iOS) để đóng,
 * đồng bộ với `BackHandler` / `handleShellOverlayBackPress`.
 */
export function ShellOverlayWithEdgeBack({
  children,
  onBack,
  style,
  pointerEvents = 'box-none',
  edgeBackEnabled = true,
}: ShellOverlayWithEdgeBackProps) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const edgeSwipeEnabled =
    Platform.OS === 'ios' && edgeBackEnabled && screenWidth > 0;

  const finishBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const panGesture = useMemo(() => {
    const dismissThreshold = screenWidth * DISMISS_WIDTH_RATIO;
    return Gesture.Pan()
      .enabled(edgeSwipeEnabled)
      .manualActivation(true)
      .onTouchesDown((event, state) => {
        'worklet';
        const touch = event.changedTouches[0];
        if (touch != null && touch.absoluteX <= EDGE_ACTIVATION_WIDTH) {
          state.activate();
          return;
        }
        state.fail();
      })
      .activeOffsetX(8)
      .failOffsetY([-14, 14])
      .onUpdate(e => {
        'worklet';
        translateX.value = Math.max(0, e.translationX);
      })
      .onEnd(e => {
        'worklet';
        const shouldDismiss =
          e.translationX > dismissThreshold || e.velocityX > DISMISS_VELOCITY;
        if (shouldDismiss) {
          translateX.value = withTiming(screenWidth, { duration: 200 }, finished => {
            if (finished) {
              runOnJS(finishBack)();
              translateX.value = 0;
            }
          });
          return;
        }
        translateX.value = withSpring(0, { damping: 22, stiffness: 320 });
      });
  }, [edgeSwipeEnabled, finishBack, screenWidth]);

  const animatedHostStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!edgeSwipeEnabled) {
    return (
      <Animated.View
        style={[styles.host, style]}
        pointerEvents={pointerEvents}
        collapsable={false}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.host, style, animatedHostStyle]}
        pointerEvents={pointerEvents}
        collapsable={false}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
});
