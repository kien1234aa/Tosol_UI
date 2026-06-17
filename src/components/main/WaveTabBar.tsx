import React, { memo, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
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

const HIDDEN_LIBRARY_BUBBLE_STYLE = {
  backgroundColor: 'transparent',
  shadowOpacity: 0,
  elevation: 0,
  borderWidth: 0,
};

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

  const focusedButtonStyle = useMemo(() => HIDDEN_LIBRARY_BUBBLE_STYLE, []);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const activeIcon = activeOptions.tabBarIcon?.({
    focused: true,
    color: tabBarColors.activeBubbleIcon,
    size: tabBarLayout.focusedIconSize,
  });

  return (
    <View
      style={[styles.wrapper, { minHeight: tabBarLayout.barHeight + insets.bottom }]}
      onLayout={onLayout}>
      <BottomFabBar
        mode="default"
        isRtl={false}
        focusedButtonStyle={focusedButtonStyle}
        bottomBarContainerStyle={BOTTOM_BAR_CONTAINER_STYLE}
        springConfig={tabBarLayout.spring}
        {...props}
      />

      {width > 0 ? (
        <Animated.View pointerEvents="none" style={[styles.floatingBubble, bubbleStyle]}>
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
    backgroundColor: tabBarColors.bubbleBackground,
    borderWidth: 2,
    borderColor: tabBarColors.bubbleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 8,
    shadowColor: lightTokens.tertiary600,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
});

export const WaveTabBar = memo(WaveTabBarComponent);

export function MainTabBar(props: BottomTabBarProps) {
  return <WaveTabBar {...props} />;
}

export const mainTabBarStyle = StyleSheet.create({
  tabBar: {
    height: tabBarLayout.barHeight,
    borderTopWidth: 0,
    overflow: 'visible',
  },
});
