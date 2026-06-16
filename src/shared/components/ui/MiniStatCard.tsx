import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import type { AppColorPalette } from '../../theme/colorPalettes';

export type MiniStatVisual = 'sparkline' | 'bars';
export type MiniStatVariant = 'light' | 'dark';

export type MiniStatCardProps = {
  title: string;
  subtitle: string;
  value: string;
  delta: string;
  visual: MiniStatVisual;
  variant?: MiniStatVariant;
  style?: StyleProp<ViewStyle>;
};

const SparkLine = () => {
  const c = useAppColors();
  const points = [3, 5, 4, 6, 5, 7, 8, 9];
  const max = Math.max(...points);

  return (
    <View style={sparkStyles.container}>
      <View style={sparkStyles.lineContainer}>
        {points.map((p, i) => (
          <View
            key={`dot-${i}-${p}`}
            style={[
              sparkStyles.dot,
              {
                bottom: (p / max) * 30,
                left: i * 9,
                backgroundColor: c.accentChartTeal,
              },
            ]}
          />
        ))}
        {points.slice(0, -1).map((p, i) => {
          const x1 = i * 9;
          const y1 = (p / max) * 30;
          const x2 = (i + 1) * 9;
          const nextPoint = points[i + 1] ?? p;
          const y2 = (nextPoint / max) * 30;
          const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
          return (
            <View
              key={`line-${i}-${p}`}
              style={[
                sparkStyles.line,
                {
                  left: x1,
                  bottom: y1,
                  width: length,
                  transform: [{ rotate: `${-angle}deg` }],
                  transformOrigin: '0 0',
                  backgroundColor: c.accentChartTeal,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const BarChart = () => {
  const c = useAppColors();
  const bars = [5, 7, 6, 8, 7, 9, 10, 11];
  const max = Math.max(...bars);

  return (
    <View style={barStyles.container}>
      {bars.map((h, i) => (
        <View key={`bar-${i}-${h}`} style={barStyles.barWrapper}>
          <View
            style={[
              barStyles.bar,
              i === bars.length - 1
                ? { backgroundColor: c.accentChartIndigo }
                : { backgroundColor: c.accentChartLavender },
              { height: (h / max) * 48 },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

function createMiniStatCardStyles(c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 14,
      width: 148,
    },
    cardLight: {
      backgroundColor: c.surfaceWhite,
    },
    cardDark: {
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textOnLightMuted,
    },
    cardTitleDark: {
      color: c.textPrimary,
    },
    cardSubtitle: {
      fontSize: 11,
      color: c.textMutedLight,
      marginTop: 1,
      marginBottom: 8,
    },
    cardSubtitleDark: {
      color: c.textMuted,
    },
    chartArea: {
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    bigNumber: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textOnLightMuted,
    },
    bigNumberDark: {
      color: c.textPrimary,
    },
    growthPositive: {
      fontSize: 12,
      fontWeight: '600',
      color: c.green,
    },
  });
}

export function MiniStatCard({
  title,
  subtitle,
  value,
  delta,
  visual,
  variant = 'light',
  style,
}: MiniStatCardProps) {
  const styles = useThemeStyleSheet(createMiniStatCardStyles);
  const isDark = variant === 'dark';

  return (
    <View
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight, style]}
    >
      <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
        {title}
      </Text>
      <Text style={[styles.cardSubtitle, isDark && styles.cardSubtitleDark]}>
        {subtitle}
      </Text>
      <View style={styles.chartArea}>
        {visual === 'sparkline' ? <SparkLine /> : <BarChart />}
      </View>
      <View style={styles.statsRow}>
        <Text style={[styles.bigNumber, isDark && styles.bigNumberDark]}>
          {value}
        </Text>
        <Text style={styles.growthPositive}>{delta}</Text>
      </View>
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  container: {
    height: 48,
    width: 80,
  },
  lineContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    height: 36,
  },
  dot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  line: {
    position: 'absolute',
    height: 2,
  },
});

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 52,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 10,
    borderRadius: 3,
  },
});

export default MiniStatCard;
