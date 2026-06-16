import React, { type ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import { useCanvasDetailStyles } from './canvasDetailTheme';

export type CanvasDetailLineItemCardProps = {
  title: string;
  subtitle?: string;
  thumbnailUri?: string | null;
  placeholderIcon?: SystemIconName;
  progressPercent?: number;
  meta?: string;
  footer?: string;
  trailing?: ReactNode;
};

/** Dòng danh sách kiểu mockup (viền trái teal, ảnh, progress). */
export function CanvasDetailLineItemCard({
  title,
  subtitle,
  thumbnailUri,
  placeholderIcon = 'cube',
  progressPercent,
  meta,
  footer,
  trailing,
}: CanvasDetailLineItemCardProps) {
  const c = useAppColors();
  const styles = useCanvasDetailStyles();
  const pct =
    progressPercent != null
      ? Math.min(100, Math.max(0, progressPercent))
      : null;

  return (
    <View style={styles.lineItemCard}>
      {thumbnailUri ? (
        <Image source={{ uri: thumbnailUri }} style={styles.lineItemThumb} />
      ) : (
        <View style={[styles.lineItemThumb, styles.lineItemThumbPh]}>
          <SystemIcon name={placeholderIcon} size={22} color={c.textMuted} />
        </View>
      )}
      <View style={styles.lineItemBody}>
        <View style={styles.lineItemHead}>
          <Text style={styles.lineItemTitle} numberOfLines={3}>
            {title}
          </Text>
          {trailing}
        </View>
        {subtitle ? (
          <Text style={styles.lineItemSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {pct != null ? (
          <View style={styles.lineItemProgressWrap}>
            <View style={styles.lineItemProgressTrack}>
              <View style={[styles.lineItemProgressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.lineItemProgressPct}>{pct}%</Text>
          </View>
        ) : null}
        {meta ? (
          <Text style={styles.lineItemMeta} numberOfLines={3}>
            {meta}
          </Text>
        ) : null}
        {footer ? <Text style={styles.lineItemFooter}>{footer}</Text> : null}
      </View>
    </View>
  );
}
