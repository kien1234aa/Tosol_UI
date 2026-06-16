import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
export {
  CanvasDetailPanel as DetailCard,
  CanvasDetailRow as DetailRow,
} from '@shared/components/ui/canvasDetail';
import type { SaleOrder } from '@services/sales/saleOrderApiTypes';
import {
  formatDateVi,
  orderStatusStepIndex,
  ORDER_DETAIL_PROGRESS_STEP_KEYS,
} from './orderDetailFormatters';

export function HorizontalOrderStepper({
  order,
  compact,
}: {
  order: SaleOrder;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const styles = useThemeStyleSheet(create_OrderDetailPrimitives_styles);
  const colors = useAppColors();

  const cur = orderStatusStepIndex(order.status);
  const dates = [
    order.created_at,
    order.confirmed_at ?? null,
    order.packed_at ?? null,
    null,
    order.shipped_at ?? null,
    order.delivered_at ?? null,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stepScroll}
    >
      {ORDER_DETAIL_PROGRESS_STEP_KEYS.map((labelKey, i) => {
        const label = t(labelKey);
        const done = cur >= 0 && i < cur;
        const active = cur >= 0 && i === cur;
        const pending = cur < 0 || i > cur;
        return (
          <View
            key={labelKey}
            style={[styles.stepCol, compact && styles.stepColSm]}
          >
            <View
              style={[
                styles.stepDot,
                done && styles.stepDotDone,
                active && styles.stepDotActive,
                pending && !active && styles.stepDotPending,
              ]}
            >
              {done ? (
                <SystemIcon name="check" size={16} color={colors.green} />
              ) : active ? (
                <SystemIcon name="cube" size={14} color={colors.tealLight} />
              ) : (
                <SystemIcon name="ellipse" size={12} color={colors.textMuted} />
              )}
            </View>
            <Text
              style={[styles.stepLab, active && styles.stepLabActive]}
              numberOfLines={2}
            >
              {label}
            </Text>
            <Text style={styles.stepDate} numberOfLines={1}>
              {formatDateVi(dates[i] ?? null)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function create_OrderDetailPrimitives_styles(c: AppColorPalette) {
  return StyleSheet.create({
    stepScroll: {
      flexDirection: 'row',
      alignItems: 'flex-start' as const,
      paddingVertical: 8,
      gap: 0,
    },
    stepCol: {
      width: 100,
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    stepColSm: { width: 88 },
    stepDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.borderLight,
      marginBottom: 6,
    },
    stepDotDone: {
      backgroundColor: 'rgba(16,185,129,0.25)',
      borderColor: c.green,
    },
    stepDotActive: {
      backgroundColor: 'rgba(61,200,200,0.25)',
      borderColor: c.tealLight,
    },
    stepDotPending: {
      opacity: 0.45,
    },
    stepLab: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 14,
    },
    stepLabActive: { color: c.tealLight },
    stepDate: {
      fontSize: 9,
      color: c.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },
  });
}
