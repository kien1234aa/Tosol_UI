import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useAppColors } from '../../../theme/ThemeContext';

export type SkeletonBoneProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  /** Tắt khi tab/màn không focus — tránh nhiều vòng Animated chạy song song. */
  animate?: boolean;
};

/** Khối shimmer nhẹ — dùng trong skeleton list / detail. */
export function SkeletonBone({
  width = '100%',
  height,
  borderRadius = 8,
  style,
  animate = false,
}: SkeletonBoneProps) {
  const c = useAppColors();
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
          backgroundColor: c.bgRowAlt,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
