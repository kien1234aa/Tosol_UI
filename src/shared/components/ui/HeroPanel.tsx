import type { ReactNode } from 'react';
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type HeroPanelVariant = 'light' | 'dark';

export type HeroPanelProps = {
  /** require(...) hoặc { uri } */
  imageSource: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  topLeft?: ReactNode;
  bottomRight?: ReactNode;
  variant?: HeroPanelVariant;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/** Chiều cao avatar thiết kế gốc — dùng làm mốc scale. */
const REF_AVATAR_H = 280;
const REF_AVATAR_W = 200;

export function HeroPanel({
  imageSource,
  imageStyle,
  topLeft,
  bottomRight,
  variant = 'light',
  height: heightProp,
  style,
}: HeroPanelProps) {
  const { width: winW, height: winH } = useWindowDimensions();
  const isDark = variant === 'dark';

  const panelH =
    heightProp ??
    Math.round(Math.min(320, Math.max(140, winH * 0.33)));

  /** Scale để avatar + viền không tràn panel (màn nhỏ / tỉ lệ dọc). */
  const layoutScale = Math.min(
    1,
    (panelH - 24) / (REF_AVATAR_H + 20),
    (winW - 16) / REF_AVATAR_W,
  );

  const avatarW = Math.round(REF_AVATAR_W * layoutScale);
  const avatarH = Math.round(REF_AVATAR_H * layoutScale);
  const circleSize = Math.round(
    Math.min(220 * layoutScale, winW * 0.66, panelH * 0.58),
  );
  const circleTop = Math.round(Math.max(6, panelH * 0.05));
  const groundW = Math.round(Math.min(200 * layoutScale, winW * 0.62));
  const groundH = Math.round(Math.max(16, 30 * layoutScale));
  const avatarBottom = Math.round(Math.max(6, 10 * layoutScale));
  const cornerPad = Math.round(8 + 4 * layoutScale);
  const groundBorderRadius = groundH / 2;

  return (
    <View style={[styles.wrapper, { height: panelH }, style]}>
      <View
        style={[
          styles.bgCircleBase,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            top: circleTop,
          },
          isDark ? styles.bgCircleDark : styles.bgCircleLight,
        ]}
      />
      <View
        style={[
          styles.groundEllipse,
          {
            width: groundW,
            height: groundH,
            borderRadius: groundBorderRadius,
          },
          isDark ? styles.groundEllipseDark : styles.groundEllipseLight,
        ]}
      />

      {topLeft ? (
        <View style={[styles.topLeft, { top: cornerPad, left: cornerPad }]}>
          {topLeft}
        </View>
      ) : null}

      <View style={[styles.avatarContainer, { bottom: avatarBottom }]}>
        <Image
          source={imageSource}
          style={[{ width: avatarW, height: avatarH }, imageStyle]}
          resizeMode="contain"
        />
      </View>

      {bottomRight ? (
        <View
          style={[styles.bottomRight, { bottom: cornerPad, right: cornerPad }]}
        >
          {bottomRight}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircleBase: {
    position: 'absolute',
    alignSelf: 'center',
  },
  bgCircleLight: {
    backgroundColor: '#e8e8e8',
  },
  bgCircleDark: {
    backgroundColor: '#1a2838',
  },
  groundEllipse: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  groundEllipseLight: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  groundEllipseDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 2,
  },
  topLeft: {
    position: 'absolute',
    zIndex: 3,
  },
  bottomRight: {
    position: 'absolute',
    zIndex: 3,
  },
});

export default HeroPanel;
