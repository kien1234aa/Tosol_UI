import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
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
    // Keep elevation on the anchor, not on the icon layer (avoids white shine dots).
    android: { elevation: 8 },
    default: {
      shadowColor: palette.glassShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
    },
  });
}

function bubbleSurfaceStyle(palette: typeof tabBarColors | typeof tabBarColorsDark) {
  return Platform.select({
    android: { elevation: 0 },
    default: {},
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
  const onTabBarHeightChange = useContext(BottomTabBarHeightCallbackContext);
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

  const tabBarHeight =
    tabBarLayout.barHeight + tabBarLayout.bubbleOverflow + insets.bottom;

  useEffect(() => {
    onTabBarHeightChange?.(tabBarHeight);
  }, [onTabBarHeightChange, tabBarHeight]);

  return (
    <View
      collapsable={false}
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
          style={[styles.bubbleAnchor, bubbleShadowStyle(palette), bubbleStyle]}>
          <View
            style={[
              styles.floatingBubble,
              bubbleSurfaceStyle(palette),
              {
                backgroundColor: palette.bubbleBackground,
                borderColor: palette.bubbleBorder,
              },
            ]}>
            <View style={styles.bubbleIcon}>{activeIcon}</View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',
    width: '100%',
  },
  glassBackdrop: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bubbleAnchor: {
    position: 'absolute',
    top: -BUBBLE_FLOAT,
    left: 0,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    zIndex: 100,
    overflow: 'visible',
  },
  floatingBubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bubbleIcon: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export const WaveTabBar = memo(WaveTabBarComponent);
