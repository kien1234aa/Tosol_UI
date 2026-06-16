import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import { useCanvasDetailStyles } from './canvasDetailTheme';
import {
  CanvasDetailMetricPair,
  CanvasDetailProgressCard,
  CanvasDetailTimelineCard,
  type CanvasDetailMetric,
  type CanvasDetailProgressItem,
} from './CanvasDetailMetrics';
import { createCanvasDetailThemeStyles } from './canvasDetailTheme';

export type CanvasDetailOverviewPanelProps = {
  title?: string;
  icon?: SystemIconName;
  metrics?: [CanvasDetailMetric, CanvasDetailMetric?];
  timeline?: { label: string; value: string; hint?: string };
  progress?: { title: string; items: CanvasDetailProgressItem[] };
  children?: ReactNode;
  /** false khi panel nằm trong tab đã có padding ngang. */
  inset?: boolean;
};

/** Khối tổng quan chuẩn mockup: metric → timeline → progress → hàng chi tiết. */
export function CanvasDetailOverviewPanel({
  title,
  icon,
  metrics,
  timeline,
  progress,
  children,
  inset = true,
}: CanvasDetailOverviewPanelProps) {
  const styles = useCanvasDetailStyles();
  const c = useAppColors();

  return (
    <View>
      {metrics != null ? (
        <CanvasDetailMetricPair
          left={metrics[0]}
          right={metrics[1]}
          inset={inset}
        />
      ) : null}
      {timeline != null ? (
        <CanvasDetailTimelineCard
          label={timeline.label}
          value={timeline.value}
          hint={timeline.hint}
          inset={inset}
        />
      ) : null}
      {progress != null && progress.items.length > 0 ? (
        <CanvasDetailProgressCard
          title={progress.title}
          items={progress.items}
          inset={inset}
        />
      ) : null}
      {(title != null || children != null) && (
        <View style={[inset && styles.screenPad, styles.blockGap]}>
          <View style={styles.panelCard}>
            {title != null ? (
              <View style={styles.panelTitleRow}>
                {icon != null ? (
                  <SystemIcon name={icon} size={18} color={c.teal} />
                ) : null}
                <Text style={styles.panelTitle}>{title}</Text>
              </View>
            ) : null}
            {children}
          </View>
        </View>
      )}
    </View>
  );
}
