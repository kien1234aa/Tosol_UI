import React from 'react';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { ON_BRAND } from '../../theme/designTokens';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import {
  View,
  Text,
  StyleSheet,
  Image,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/** Template trắng — `tintColor` theo `c.teal` (BRAND_HEX). */
const LOGO = require('@assets/images/logo-template.png');

export type AppLogoVariant = 'default' | 'dark' | 'compact';

export type AppLogoProps = {
  variant?: AppLogoVariant;
  brandName?: string;
  tagline?: string;
  /** Hiện chữ thương hiệu / tagline cạnh ảnh logo. */
  showText?: boolean;
  /** Chiều cao khung logo (px). */
  logoHeight?: number;
  /** Chiều rộng tối đa khung logo (px) — logo rộng sẽ scale theo `resizeMode="contain"`. */
  logoMaxWidth?: number;
  /** Logo trong vòng tròn nền teal (menu drawer). */
  logoRing?: boolean;
  /** Căn ngang khối logo (mặc định trái). */
  align?: 'start' | 'center';
  style?: StyleProp<ViewStyle>;
};

export function AppLogo({
  variant = 'default',
  brandName = 'TOSOL',
  tagline = 'FULFILLMENT',
  showText = true,
  logoHeight,
  logoMaxWidth,
  logoRing = false,
  align = 'start',
  style,
}: AppLogoProps) {
  const styles = useThemeStyleSheet(create_AppLogo_styles);

  const isDark = variant === 'dark';
  const isCompact = variant === 'compact';

  const h = logoHeight ?? (isCompact ? 36 : 44);
  const maxW = logoMaxWidth ?? (isCompact ? 168 : 220);
  /** Logo tròn — clip vuông sát biểu tượng, tránh khoảng trống lệch cạnh chữ brand. */
  const logoClipW = Math.min(maxW, h);
  const ringOuter = Math.max(h + 10, 48);
  const ringPad = 5;
  const ringImg = Math.max(ringOuter - ringPad * 2, 20);

  const logoMark = logoRing ? (
    <View
      style={[
        styles.logoRingOuter,
        {
          width: ringOuter,
          height: ringOuter,
          borderRadius: ringOuter / 2,
          padding: ringPad,
        },
      ]}
    >
      <Image
        source={LOGO}
        style={[
          styles.logoTintOnBrand,
          { width: ringImg, height: ringImg },
        ]}
        resizeMode="contain"
      />
    </View>
  ) : (
    <View style={[styles.logoClip, { width: logoClipW, height: h }]}>
      <Image
        source={LOGO}
        style={[styles.logoImg, styles.logoTint]}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        align === 'center' && styles.containerCenter,
        style,
      ]}
    >
      {logoMark}

      {showText ? (
        <View style={styles.textWrapper}>
          <Text
            style={[
              styles.brandName,
              isCompact && styles.brandNameSm,
              isDark ? styles.brandNameDark : styles.brandNameLight,
            ]}
            numberOfLines={1}
          >
            {brandName}
          </Text>
          {tagline.trim() ? (
            <Text
              style={[
                styles.tagline,
                isCompact && styles.taglineSm,
                isDark ? styles.taglineDark : styles.taglineLight,
              ]}
              numberOfLines={1}
            >
              {tagline}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function create_AppLogo_styles(c: AppColorPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      alignSelf: 'flex-start',
      gap: 10,
      minWidth: 0,
    },
    containerCenter: {
      alignSelf: 'center',
    },
    logoClip: {
      alignSelf: 'flex-start',
      justifyContent: 'center',
    },
    logoRingOuter: {
      alignSelf: 'flex-start',
      backgroundColor: c.teal,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoImg: {
      width: '100%',
      height: '100%',
    },
    logoTint: {
      tintColor: c.teal,
    },
    logoTintOnBrand: {
      tintColor: ON_BRAND,
    },
    textWrapper: {
      flexDirection: 'column',
      justifyContent: 'center',
      flexShrink: 1,
      minWidth: 0,
    },
    brandName: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: 2,
      lineHeight: 24,
    },
    brandNameSm: {
      fontSize: 18,
      lineHeight: 20,
      letterSpacing: 1.5,
    },
    brandNameLight: {
      color: c.textOnLight,
    },
    brandNameDark: {
      color: c.textPrimary,
    },
    tagline: {
      fontSize: 9,
      fontWeight: '500',
      letterSpacing: 3,
    },
    taglineSm: {
      fontSize: 8,
      letterSpacing: 2,
    },
    taglineLight: {
      color: c.textMutedLight,
    },
    taglineDark: {
      color: c.textMuted,
    },
  });
}

export default AppLogo;
