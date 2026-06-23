import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { SharedValue } from 'react-native-reanimated';
import { tabBarLayout } from '@/src/configs/main';
import { getWaveTabShape } from './getWaveTabShape';

type WaveTabBarNotchProps = {
  barWidth: number;
  barHeight: number;
  fill: string;
  bubbleCenterX: SharedValue<number>;
};

function WaveTabBarNotchComponent({
  barWidth,
  barHeight,
  fill,
  bubbleCenterX,
}: WaveTabBarNotchProps) {
  const notchWidth = tabBarLayout.waveNotchWidth;
  const svgWidth = barWidth * 2.1;
  const svgHeight = barHeight;

  const pathD = useMemo(
    () => getWaveTabShape(barWidth, barHeight, notchWidth),
    [barWidth, barHeight, notchWidth],
  );

  const waveOffset = barWidth + notchWidth / 2;

  const animatedLayerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleCenterX.value - waveOffset }],
  }));

  if (barWidth <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.wrapper, { height: svgHeight }]}>
      <Animated.View
        style={[
          styles.slidingLayer,
          { width: svgWidth, height: svgHeight },
          animatedLayerStyle,
        ]}>
        <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <Path d={pathD} fill={fill} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'visible',
  },
  slidingLayer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    overflow: 'visible',
  },
});

export const WaveTabBarNotch = memo(WaveTabBarNotchComponent);
