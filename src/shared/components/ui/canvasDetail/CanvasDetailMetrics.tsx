import React from 'react';
import { Text, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import {
  createCanvasDetailThemeStyles,
  useCanvasDetailStyles,
} from './canvasDetailTheme';

export type CanvasDetailMetric = {
  label: string;
  value: string;
  icon?: SystemIconName;
};

export function CanvasDetailMetricPair({
  left,
  right,
  inset = true,
}: {
  left: CanvasDetailMetric;
  right?: CanvasDetailMetric;
  /** false khi đã nằm trong vùng có padding ngang (tab panel). */
  inset?: boolean;
}) {
  const c = useAppColors();
  const styles = useCanvasDetailStyles();

  return (
    <View style={[inset && styles.screenPad, styles.blockGap]}>
      <View style={styles.metricRow}>
        <MetricCell metric={left} iconColor={c.teal} styles={styles} />
        {right != null ? (
          <MetricCell metric={right} iconColor={c.green} styles={styles} />
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    </View>
  );
}

function MetricCell({
  metric,
  iconColor,
  styles,
}: {
  metric: CanvasDetailMetric;
  iconColor: string;
  styles: ReturnType<typeof createCanvasDetailThemeStyles>;
}) {
  return (
    <View style={styles.metricCard}>
      {metric.icon != null ? (
        <View style={styles.metricIconSlot}>
          <SystemIcon name={metric.icon} size={20} color={iconColor} />
        </View>
      ) : null}
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>
        {metric.value}
      </Text>
    </View>
  );
}

export function CanvasDetailTimelineCard({
  label,
  value,
  hint,
  inset = true,
}: {
  label: string;
  value: string;
  hint?: string;
  inset?: boolean;
}) {
  const styles = useCanvasDetailStyles();

  return (
    <View style={[inset && styles.screenPad, styles.blockGap]}>
      <View style={styles.bannerCard}>
        <Text style={styles.bannerLabel}>{label}</Text>
        <View style={styles.bannerRow}>
          <Text style={styles.bannerValue}>{value}</Text>
          {hint != null && hint.length > 0 ? (
            <Text style={styles.bannerHint}>{hint}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export type CanvasDetailProgressItem = {
  label: string;
  percent: number;
};

export function CanvasDetailProgressCard({
  title,
  items,
  inset = true,
}: {
  title: string;
  items: CanvasDetailProgressItem[];
  inset?: boolean;
}) {
  const styles = useCanvasDetailStyles();

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={[inset && styles.screenPad, styles.blockGap]}>
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>{title}</Text>
        {items.map((item, i) => {
          const pct = Math.min(100, Math.max(0, item.percent));
          return (
            <View
              key={item.label}
              style={[
                styles.progressItem,
                i === items.length - 1 && styles.progressItemLast,
              ]}
            >
              <View style={styles.progressHead}>
                <Text style={styles.progressLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.progressPct}>{pct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
