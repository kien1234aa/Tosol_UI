import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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
import { WaveTabBarNotch } from './waveTabBar/WaveTabBarNotch';
import {
  getBubbleCenterX,
  getBubbleTranslateX,
} from './waveTabBar/waveTabBarMotion';

const { bubbleSize: BUBBLE_SIZE, bubbleFloatOffset: BUBBLE_FLOAT } = tabBarLayout;

const BOTTOM_BAR_CONTAINER_STYLE = {
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  overflow: 'visible' as const,
  zIndex: 2,
  backgroundColor: 'transparent' as const,
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

function bubbleSurfaceStyle(palette: typeof tabBarColors | typeof tabBarColorsDark) {
  return Platform.select({
    android: { elevation: 0 },
    default: {},
  });
}

/**
 * Bottom bar with a semicircular concave notch on the top edge that follows the glass bubble.
 */
function WaveTabBarComponent(props: BottomTabBarProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? tabBarColorsDark : tabBarColors;
  const { state, descriptors } = props;
  const insets = useSafeAreaInsets();
  const onTabBarHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const [width, setWidth] = useState(0);
  const bubbleCenterX = useSharedValue(0);
  const bubbleTranslateX = useSharedValue(0);
  const tabCount = state.routes.length;

  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors[activeRoute.key].options;
  const isHomeActive = activeRoute.name === 'Home';

  useEffect(() => {
    if (width === 0) {
      return;
    }

    const centerX = getBubbleCenterX(width, tabCount, state.index);
    const leftX = getBubbleTranslateX(width, tabCount, state.index);

    bubbleCenterX.value = withSpring(centerX, tabBarLayout.spring);
    bubbleTranslateX.value = withSpring(leftX, tabBarLayout.spring);
  }, [
    bubbleCenterX,
    bubbleTranslateX,
    state.index,
    tabCount,
    width,
  ]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleTranslateX.value }],
  }));

  const focusedButtonStyle = useMemo(() => HIDDEN_LIBRARY_FAB_STYLE, []);

  const activeIcon = activeOptions.tabBarIcon?.({
    focused: true,
    color: palette.activeBubbleIcon,
    size: isHomeActive ? tabBarLayout.bubbleSize : tabBarLayout.focusedIconSize,
  });

  const barBodyHeight = tabBarLayout.barHeight + insets.bottom;
  const tabBarHeight = tabBarLayout.barHeight + tabBarLayout.bubbleOverflow + insets.bottom;

  useEffect(() => {
    onTabBarHeightChange?.(tabBarHeight);
  }, [onTabBarHeightChange, tabBarHeight]);

  return (
    <View
      collapsable={false}
      style={[styles.wrapper, { minHeight: tabBarLayout.barHeight + insets.bottom }]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <WaveTabBarNotch
          barWidth={width}
          barHeight={barBodyHeight}
          fill={palette.waveBackground}
          bubbleCenterX={bubbleCenterX}
        />
      ) : null}

      <BottomFabBar
        mode="default"
        isRtl={false}
        focusedButtonStyle={focusedButtonStyle}
        bottomBarContainerStyle={[
          BOTTOM_BAR_CONTAINER_STYLE,
          { zIndex: 2 },
        ]}
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
              isHomeActive ? styles.homeBubble : null,
              !isHomeActive && {
                backgroundColor: palette.bubbleBackground,
                borderColor: palette.bubbleBorder,
              },
            ]}>
            <View style={[styles.bubbleIcon, isHomeActive && styles.homeBubbleIcon]}>
              {activeIcon}
            </View>
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
  homeBubble: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  bubbleIcon: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  homeBubbleIcon: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
  },
});

export const WaveTabBar = memo(WaveTabBarComponent);
