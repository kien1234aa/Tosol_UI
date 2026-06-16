import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppColorPalette } from '../../../theme/colorPalettes';
import { BRAND_HEX } from '../../../theme/designTokens';
import { listMobileCard } from '../../../theme/surfaceStyles';
import { useAppColors, useThemeMode } from '../../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../../theme/useThemeStyleSheet';
import { LIST_CARD } from '../../../theme/designTokens';

export type CompactListMobileCardProps = {
  /** Dòng 1 — tiêu đề / mã (bắt buộc). */
  title: string;
  /** Góc phải dòng 1 — pill, giá, v.v. */
  titleRight?: ReactNode;
  /** Dòng 2 — mô tả chính. */
  subtitle?: string;
  /** Dòng 2b — phụ trợ ngay dưới subtitle (ví dụ tên SP thứ 2 / +N sản phẩm khác). */
  subtitleSecondary?: string;
  /** Dòng 3 — meta phụ (1 dòng). */
  detail?: string;
  /** Dòng 4 trái. */
  footerLeft?: string;
  /** Dòng 4 phải — thường là số tiền. */
  footerRight?: string;
  footerLeftAccent?: boolean;
  footerRightAccent?: boolean;
  /** Ảnh / icon bên trái (tuỳ chọn). */
  leading?: ReactNode;
  onPress?: () => void;
};

/**
 * Thẻ danh sách gọn — tối đa 4 nhóm thông tin (demo seller).
 * Chạm cả thẻ để mở chi tiết.
 */
export function CompactListMobileCard({
  title,
  titleRight,
  subtitle,
  subtitleSecondary,
  detail,
  footerLeft,
  footerRight,
  footerLeftAccent = false,
  footerRightAccent = false,
  leading,
  onPress,
}: CompactListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const styles = useThemeStyleSheet(createCompactListMobileCardStyles);
  const cardSurface = listMobileCard(c, mode);
  const accentColor = mode === 'dark' ? c.textLink : BRAND_HEX;

  const hasFooter =
    (footerLeft != null && footerLeft.length > 0) ||
    (footerRight != null && footerRight.length > 0);

  const body = (
    <View style={styles.row}>
      {leading != null ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.col}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {titleRight != null ? (
            <View style={styles.titleRight}>{titleRight}</View>
          ) : null}
        </View>
        {subtitle != null && subtitle.length > 0 ? (
          <Text
            style={[styles.subtitle, { color: c.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
        {subtitleSecondary != null && subtitleSecondary.length > 0 ? (
          <Text
            style={[styles.subtitleSecondary, { color: c.textMuted }]}
            numberOfLines={1}
          >
            {subtitleSecondary}
          </Text>
        ) : null}
        {detail != null && detail.length > 0 ? (
          <Text style={[styles.detail, { color: c.textMuted }]} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
        {hasFooter ? (
          <View style={styles.footerRow}>
            {footerLeft != null && footerLeft.length > 0 ? (
              <Text
                style={[
                  footerLeftAccent ? styles.footerAccent : styles.footerText,
                  {
                    color: footerLeftAccent ? accentColor : c.textMuted,
                    flex: footerLeftAccent ? undefined : 1,
                  },
                ]}
                numberOfLines={1}
              >
                {footerLeft}
              </Text>
            ) : (
              <View style={styles.footerSpacer} />
            )}
            {footerRight != null && footerRight.length > 0 ? (
              <Text
                style={[
                  styles.footerAccent,
                  {
                    color: footerRightAccent ? accentColor : c.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {footerRight}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );

  if (onPress != null) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          cardSurface,
          pressed && { opacity: 0.94 },
        ]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.card, cardSurface]}>{body}</View>;
}

function createCompactListMobileCardStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      paddingHorizontal: LIST_CARD.padH,
      paddingVertical: LIST_CARD.padV,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: LIST_CARD.leadingGap,
    },
    leading: {
      flexShrink: 0,
    },
    col: {
      flex: 1,
      minWidth: 0,
      gap: LIST_CARD.lineGap,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },
    title: {
      flex: 1,
      fontSize: LIST_CARD.fontTitle,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    titleRight: {
      flexShrink: 0,
    },
    subtitle: {
      fontSize: LIST_CARD.fontBody,
      fontWeight: '500',
    },
    subtitleSecondary: {
      fontSize: LIST_CARD.fontMeta,
      fontWeight: '500',
    },
    detail: {
      fontSize: LIST_CARD.fontMeta,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 2,
    },
    footerSpacer: {
      flex: 1,
    },
    footerText: {
      flex: 1,
      fontSize: LIST_CARD.fontMeta,
      minWidth: 0,
    },
    footerAccent: {
      fontSize: LIST_CARD.fontAccent,
      fontWeight: '700',
      flexShrink: 0,
    },
  });
}
