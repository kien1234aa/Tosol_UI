import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { getModelActivities } from '@services/activity/activityAPI';
import type { ActivityLogApi } from '@services/activity/activityApiTypes';
import { orderActivityToRow } from '@mappers/sales/orderActivityMappers';
import { DetailCard } from './OrderDetailPrimitives';

export type OrderDetailActivityLogPanelProps = {
  orderId: number;
  reloadSignal?: string | number;
};

function ActivityTimelineItem({
  row,
  isFirst,
  isLast,
  styles,
}: {
  row: ReturnType<typeof orderActivityToRow>;
  isFirst: boolean;
  isLast: boolean;
  styles: ReturnType<typeof createActivityLogPanelStyles>;
}) {
  const metaParts = [row.actorName, row.detailLine].filter(
    (p): p is string => p != null && p.length > 0,
  );

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View
          style={[
            styles.timelineDot,
            isFirst ? styles.timelineDotActive : styles.timelineDotMuted,
          ]}
        />
        {!isLast ? <View style={styles.timelineStem} /> : null}
      </View>
      <View
        style={[styles.timelineBody, isLast && styles.timelineBodyLast]}
      >
        <Text style={styles.timelineTitle} numberOfLines={2}>
          {row.title}
        </Text>
        {metaParts.length > 0 ? (
          <Text style={styles.timelineSub} numberOfLines={3}>
            {metaParts.join(' · ')}
          </Text>
        ) : null}
        <Text style={styles.timelineMeta} numberOfLines={2}>
          {row.createdAtDisplay}
        </Text>
      </View>
    </View>
  );
}

export function OrderDetailActivityLogPanel({
  orderId,
  reloadSignal = 0,
}: OrderDetailActivityLogPanelProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createActivityLogPanelStyles);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ActivityLogApi[]>([]);
  const [rows, setRows] = useState<ReturnType<typeof orderActivityToRow>[]>(
    [],
  );

  useEffect(() => {
    setRows(items.map(orderActivityToRow));
  }, [items, i18nInstance.language]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getModelActivities('SaleOrder', orderId, {
        per_page: 50,
      });
      setItems(res.items);
    } catch (e: unknown) {
      setItems([]);
      setError(
        e instanceof Error
          ? e.message
          : t('orders.detail.activityLoadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load, reloadSignal]);

  return (
    <DetailCard title={t('orders.detail.activityTitle')} icon="activity">
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.tealLight} />
          <Text style={styles.loadingTxt}>
            {t('orders.detail.activityLoading')}
          </Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errBox}>
          <Text style={styles.errTxt}>{error}</Text>
          <Pressable onPress={() => void load()} hitSlop={8}>
            <Text style={styles.retryTxt}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && rows.length === 0 ? (
        <View style={styles.emptyInner}>
          <View style={styles.emptyIconSlot}>
            <SystemIcon name="activity" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>
            {t('orders.detail.activityEmptyTitle')}
          </Text>
          <Text style={styles.emptyHint}>
            {t('orders.detail.activityEmptyHint')}
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={styles.timelineList}>
          {rows.map((row, index) => (
            <ActivityTimelineItem
              key={row.id}
              row={row}
              isFirst={index === 0}
              isLast={index === rows.length - 1}
              styles={styles}
            />
          ))}
        </View>
      ) : null}
    </DetailCard>
  );
}

function createActivityLogPanelStyles(c: AppColorPalette) {
  return StyleSheet.create({
    centerBox: {
      alignItems: 'center',
      paddingVertical: 20,
      gap: 10,
    },
    loadingTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
    },
    errBox: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
      marginBottom: 12,
    },
    errTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.red,
      marginBottom: 8,
    },
    retryTxt: {
      fontSize: 13,
      fontWeight: '800',
      color: c.cyan,
    },
    emptyInner: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    emptyIconSlot: {
      marginBottom: 8,
      opacity: 0.45,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 6,
    },
    emptyHint: {
      fontSize: 12,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 17,
    },
    timelineList: {
      paddingTop: 4,
    },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 12,
    },
    timelineRail: {
      width: 10,
      alignItems: 'center',
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
    },
    timelineDotActive: {
      backgroundColor: c.teal,
    },
    timelineDotMuted: {
      backgroundColor: c.textMuted,
    },
    timelineStem: {
      width: 2,
      flex: 1,
      minHeight: 28,
      marginTop: 4,
      backgroundColor: c.border,
      borderRadius: 1,
    },
    timelineBody: {
      flex: 1,
      minWidth: 0,
      paddingBottom: 20,
    },
    timelineBodyLast: {
      paddingBottom: 0,
    },
    timelineTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
      lineHeight: 20,
    },
    timelineSub: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      marginTop: 4,
      lineHeight: 17,
    },
    timelineMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
      lineHeight: 17,
    },
  });
}
