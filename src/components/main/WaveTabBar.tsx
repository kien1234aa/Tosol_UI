import React, { memo, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomFabBar } from 'rn-wave-bottom-bar';
import { tabBarColors, tabBarLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';

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

const BUBBLE_PLATFORM_STYLE = Platform.select({
  android: {
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  default: {
    elevation: 8,
    shadowColor: lightTokens.tertiary600,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
});

/** BottomFabBar + bong bóng icon trượt theo tab đang focus. */
function WaveTabBarComponent(props: BottomTabBarProps) {
  const { state, descriptors } = props;
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const translateX = useSharedValue(0);
  const tabCount = state.routes.length;

  const activeRoute = state.routes[state.index];
  const activeOptions = descriptors[activeRoute.key].options;

  useEffect(() => {
    if (width === 0) {
      return;
    }

    const tabWidth = width / tabCount;
    const x = tabWidth * state.index + (tabWidth - BUBBLE_SIZE) / 2;
    translateX.value = withSpring(x, tabBarLayout.spring);
  }, [state.index, width, tabCount, translateX]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const focusedButtonStyle = useMemo(() => HIDDEN_LIBRARY_FAB_STYLE, []);

  const activeIcon = activeOptions.tabBarIcon?.({
    focused: true,
    color: tabBarColors.activeBubbleIcon,
    size: tabBarLayout.focusedIconSize,
  });

  return (
    <View
      style={[styles.wrapper, { minHeight: tabBarLayout.barHeight + insets.bottom }]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
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
            BUBBLE_PLATFORM_STYLE,
            {
              backgroundColor: tabBarColors.bubbleBackground,
              borderColor: tabBarColors.bubbleBorder,
            },
            bubbleStyle,
          ]}>
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
  floatingBubble: {
    position: 'absolute',
    top: -BUBBLE_FLOAT,
    left: 0,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});

export const WaveTabBar = memo(WaveTabBarComponent);
