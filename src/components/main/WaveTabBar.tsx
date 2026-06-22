import React, { memo, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomFabBar } from 'rn-wave-bottom-bar';
import {
  tabBarColors,
  tabBarColorsDark,
  tabBarLayout,
} from '@/src/configs/main';
import { getBubbleTranslateX } from './waveTabBar/getBubbleTranslateX';

const { bubbleSize: BUBBLE_SIZE, bubbleFloatOffset: BUBBLE_FLOAT } = tabBarLayout;

const BOTTOM_BAR_CONTAINER_STYLE = {
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  overflow: 'visible' as const,
};

const HIDDEN_LIBRARY_FAB_STYLE = {
  backgroundColor: 'transparent',
  shadowOpacity: 0,
  elevation: 0,
  borderWidth: 0,
};

function bubbleShadowStyle(palette: typeof tabBarColors | typeof tabBarColorsDark) {
  return Platform.select({
    android: { elevation: 10 },
    default: {
      shadowColor: palette.glassShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
    },
  });
}

/**
 * `rn-wave-bottom-bar` wave + floating glass bubble that slides to the active tab.
 * The library handles the wave notch animation; we render the active icon in a
 * frosted-glass bubble with a spring pop on each tab change.
 */
function WaveTabBarComponent(props: BottomTabBarProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? tabBarColorsDark : tabBarColors;
  const { state, descriptors } = props;
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const translateX = useSharedValue(0);
  const bubbleScale = useSharedValue(1);
  const tabCount = state.routes.length;

  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors[activeRoute.key].options;

  useEffect(() => {
    if (width === 0) {
      return;
    }

    const x = getBubbleTranslateX(width, tabCount, state.index);
    translateX.value = withSpring(x, tabBarLayout.spring);
    bubbleScale.value = withSequence(
      withSpring(1.14, tabBarLayout.bubblePopSpring),
      withSpring(1, tabBarLayout.spring),
    );
  }, [bubbleScale, state.index, tabCount, translateX, width]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: bubbleScale.value },
    ],
  }));

  const focusedButtonStyle = useMemo(() => HIDDEN_LIBRARY_FAB_STYLE, []);

  const activeIcon = activeOptions.tabBarIcon?.({
    focused: true,
    color: palette.activeBubbleIcon,
    size: tabBarLayout.focusedIconSize,
  });

  return (
    <View
      style={[styles.wrapper, { minHeight: tabBarLayout.barHeight + insets.bottom }]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <View
        pointerEvents="none"
        style={[
          styles.glassBackdrop,
          {
            borderTopColor: palette.borderTop,
            backgroundColor: palette.waveBackground,
          },
        ]}
      />

      <BottomFabBar
        mode="default"
        isRtl={false}
        focusedButtonStyle={focusedButtonStyle}
        bottomBarContainerStyle={BOTTOM_BAR_CONTAINER_STYLE}
        springConfig={tabBarLayout.spring}
        {...props}
      />

      {width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingBubble,
            bubbleShadowStyle(palette),
            {
              backgroundColor: palette.bubbleBackground,
              borderColor: palette.bubbleBorder,
            },
            bubbleStyle,
          ]}>
          <View
            style={[
              styles.glassHighlight,
              { backgroundColor: palette.glassHighlight },
            ]}
          />
          {activeIcon}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',

  },
  glassBackdrop: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  floatingBubble: {
    position: 'absolute',
    top: -BUBBLE_FLOAT,
    left: 0,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    overflow: 'hidden',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BUBBLE_SIZE * 0.42,
    borderTopLeftRadius: BUBBLE_SIZE / 2,
    borderTopRightRadius: BUBBLE_SIZE / 2,
  },
});

export const WaveTabBar = memo(WaveTabBarComponent);
