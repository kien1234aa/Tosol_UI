import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { SaleOrder } from '@services/sales/saleOrderApiTypes';
import {
  formatDateVi,
  orderStatusStepIndex,
  ORDER_DETAIL_PROGRESS_STEP_KEYS,
} from './orderDetailFormatters';

const LINE_GREY = '#2a3444';

type Props = {
  order: SaleOrder;
  /** Khi nằm đầu thẻ card: bỏ viền/margin trên để khối gọn. */
  edge?: 'top' | 'default';
};

export function OrderDetailProgressStrip({ order, edge = 'default' }: Props) {
  const { t } = useTranslation();
  const styles = useThemeStyleSheet(create_OrderDetailProgressStrip_styles);
  const palette = useAppColors();

  const cur = orderStatusStepIndex(order.status);
  const n = ORDER_DETAIL_PROGRESS_STEP_KEYS.length;

  const dates = useMemo(
    () => [
      order.created_at,
      order.confirmed_at ?? null,
      order.packed_at ?? null,
      null as string | null,
      order.shipped_at ?? null,
      order.delivered_at ?? null,
    ],
    [
      order.created_at,
      order.confirmed_at,
      order.packed_at,
      order.shipped_at,
      order.delivered_at,
    ],
  );

  const linePct = useMemo(() => {
    if (cur < 0 || n <= 1) {
      return 0;
    }
    return Math.min(100, Math.round((cur / (n - 1)) * 100));
  }, [cur, n]);

  const isDelivered = order.status === 'delivered';

  return (
    <View style={[styles.wrap, edge === 'top' && styles.wrapTop]}>
      <Text style={styles.title}>{t('orders.progressTitle')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        <View style={styles.track}>
          <View style={[styles.lineBase, { backgroundColor: LINE_GREY }]} />
          <View style={[styles.lineFill, { width: `${linePct}%` }]} />

          <View style={styles.nodesRow}>
            {ORDER_DETAIL_PROGRESS_STEP_KEYS.map((labelKey, i) => {
              const label = t(labelKey);
              const filled = cur >= 0 && i <= cur;
              const isPast = cur >= 0 && i < cur;
              const isCurrent = cur >= 0 && i === cur;
              const lastStep = i === n - 1;
              const showCheck =
                isPast || (isCurrent && isDelivered && lastStep);
              const iconName = showCheck
                ? 'check'
                : isCurrent
                ? 'package'
                : 'ellipse';
              const iconColor = filled ? '#ffffff' : palette.textMuted;
              const ringFinal = isDelivered && isCurrent && lastStep;

              return (
                <View key={labelKey} style={styles.nodeCol}>
                  <View
                    style={[styles.dotWrap, ringFinal && styles.dotWrapRing]}
                  >
                    <View
                      style={[
                        styles.dot,
                        filled ? styles.dotOn : styles.dotOff,
                      ]}
                    >
                      <SystemIcon name={iconName} size={14} color={iconColor} />
                    </View>
                  </View>
                  <Text
                    style={[styles.lab, filled && styles.labOn]}
                    numberOfLines={2}
                  >
                    {label}
                  </Text>
                  <Text style={styles.dt} numberOfLines={1}>
                    {i === 3 &&
                    (dates[3] == null || dates[3] === '') &&
                    !isPast &&
                    !isCurrent
                      ? ''
                      : formatDateVi(dates[i] ?? null)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const NODE_W = 96;

function create_OrderDetailProgressStrip_styles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      marginTop: 18,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    wrapTop: {
      marginTop: 0,
      paddingTop: 0,
      borderTopWidth: 0,
    },
    title: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 10,
    },
    scrollInner: {
      paddingBottom: 6,
      paddingRight: 8,
    },
    track: {
      minWidth: NODE_W * 6,
      paddingHorizontal: 8,
      paddingTop: 4,
      position: 'relative',
    },
    lineBase: {
      position: 'absolute',
      left: NODE_W / 2,
      right: NODE_W / 2,
      top: 18,
      height: 3,
      borderRadius: 2,
      zIndex: 0,
    },
    lineFill: {
      position: 'absolute',
      left: NODE_W / 2,
      top: 18,
      height: 3,
      borderRadius: 2,
      backgroundColor: c.green,
      zIndex: 1,
    },
    nodesRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      zIndex: 2,
    },
    nodeCol: {
      width: NODE_W,
      alignItems: 'center',
      paddingHorizontal: 2,
    },
    dotWrap: {
      marginBottom: 6,
      padding: 2,
      borderRadius: 20,
    },
    dotWrapRing: {
      borderWidth: 2,
      borderColor: '#f1f5f9',
    },
    dot: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    dotOn: {
      backgroundColor: c.green,
      borderColor: c.green,
    },
    dotOff: {
      backgroundColor: c.bgInput,
      borderColor: c.borderLight,
      opacity: 0.75,
    },
    lab: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 13,
      minHeight: 28,
    },
    labOn: {
      color: c.textPrimary,
    },
    dt: {
      fontSize: 9,
      color: c.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },
  });
}
