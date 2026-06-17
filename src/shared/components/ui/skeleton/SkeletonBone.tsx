import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { lightTokens } from '@/src/configs/theme';

export type SkeletonBoneProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  /** Disable when tab/screen is not focused to avoid parallel animation loops. */
  animate?: boolean;
};

/** Lightweight shimmer block for list/detail skeletons. */
export function SkeletonBone({
  width = '100%',
  height,
  borderRadius = 8,
  style,
  animate = true,
}: SkeletonBoneProps) {
  const pulse = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    if (!animate) {
      pulse.setValue(0.55);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.88,
          duration: 780,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.42,
          duration: 780,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, pulse]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: lightTokens.secondary200,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
