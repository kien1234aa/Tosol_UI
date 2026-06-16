import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import { useCanvasDetailStyles } from './canvasDetailTheme';

export type CanvasDetailHeroCardProps = {
  title: string;
  subtitle?: string;
  healthLabel?: string;
  healthValue?: string;
  statusSlot?: ReactNode;
  trailing?: ReactNode;
  footer?: ReactNode;
};

export function CanvasDetailHeroCard({
  title,
  subtitle,
  healthLabel,
  healthValue,
  statusSlot,
  trailing,
  footer,
}: CanvasDetailHeroCardProps) {
  const c = useAppColors();
  const styles = useCanvasDetailStyles();

  return (
    <View style={[styles.screenPad, styles.blockGap]}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBody}>
            {statusSlot}
            <Text style={styles.heroTitle}>{title}</Text>
            {subtitle ? (
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
            {healthLabel != null && healthValue != null ? (
              <View style={styles.healthRow}>
                <SystemIcon name="checkCircle" size={14} color={c.teal} />
                <Text style={styles.healthLabel}>{healthLabel}</Text>
                <Text style={styles.healthValue}>{healthValue}</Text>
              </View>
            ) : null}
          </View>
          {trailing}
        </View>
        {footer != null ? <View style={styles.heroFooter}>{footer}</View> : null}
      </View>
    </View>
  );
}
