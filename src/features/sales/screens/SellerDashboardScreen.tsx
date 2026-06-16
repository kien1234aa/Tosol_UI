import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SalesScreenHeader } from '../components/SalesScreenHeader';
import { sellerChromeScrollContent } from '@shared/components/sellerChrome';
import {
  CanvasListSection,
  CanvasListStatsBand,
} from '@shared/components/ui/canvasScreen/CanvasListScreenChrome';
import { useCanvasScreenStyles } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import {
  CompactStatMetric,
  compactStatMetricRowStyles,
} from '@shared/components/ui/CompactStatMetric';
import { SellerChromeFilterChips } from '@shared/components/sellerChrome/SellerChromeFilterChips';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import { SectionTitle } from '@shared/components/ui/SectionTitle';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { fetchSellerDashboard } from '@services/sales/sellerSlice';
import type { DashboardOrdersByStatus } from '@services/sales/sellerResponseTypes';
import {
  formatMoneyFromApi,
  formatMoneyVndNumber,
} from './orderDetail/orderDetailFormatters';

export type SellerDashboardScreenProps = {
  onOpenDrawer: () => void;
};

type DashboardRangeKey = '7d' | '30d' | 'thisMonth' | 'lastMonth';

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function resolveDashboardDateRange(
  key: DashboardRangeKey,
  today = new Date(),
): { from_date: string; to_date: string } {
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const to_date = formatYmd(to);

  if (key === '7d') {
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    return { from_date: formatYmd(from), to_date };
  }
  if (key === '30d') {
    const from = new Date(to);
    from.setDate(from.getDate() - 29);
    return { from_date: formatYmd(from), to_date };
  }
  if (key === 'thisMonth') {
    const from = new Date(to.getFullYear(), to.getMonth(), 1);
    return { from_date: formatYmd(from), to_date };
  }
  const from = new Date(to.getFullYear(), to.getMonth() - 1, 1);
  const lastDayPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
  return { from_date: formatYmd(from), to_date: formatYmd(lastDayPrevMonth) };
}

function statusCount(byStatus: DashboardOrdersByStatus, ...keys: string[]): number {
  return keys.reduce((sum, key) => sum + (byStatus[key] ?? 0), 0);
}

function formatRevenueFromApi(totalByCurrency: unknown[]): string {
  if (!Array.isArray(totalByCurrency) || totalByCurrency.length === 0) {
    return '—';
  }
  const first = totalByCurrency[0];
  if (first == null || typeof first !== 'object') {
    return '—';
  }
  const row = first as Record<string, unknown>;
  const raw = row.amount ?? row.total ?? row.value;
  if (typeof raw === 'number') {
    return formatMoneyVndNumber(raw, 0);
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    return formatMoneyFromApi(raw, 0);
  }
  return '—';
}

function greetingKeyForHour(hour: number): string {
  if (hour < 12) {
    return 'dashboard.greeting.morning';
  }
  if (hour < 18) {
    return 'dashboard.greeting.afternoon';
  }
  return 'dashboard.greeting.evening';
}

function orderStatusLabelKey(status: string): string {
  return `orders.status.${status}`;
}

export function SellerDashboardScreen({ onOpenDrawer }: SellerDashboardScreenProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const canvasStyles = useCanvasScreenStyles();
  const styles = useThemeStyleSheet(createSellerDashboardScreenStyles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { dashboard, loading, refreshing, error } = useAppSelector(s => s.seller);

  const [rangeKey, setRangeKey] = useState<DashboardRangeKey>('7d');

  const rangeParams = useMemo(
    () => resolveDashboardDateRange(rangeKey),
    [rangeKey],
  );

  const loadDashboard = useCallback(() => {
    void dispatch(fetchSellerDashboard(rangeParams));
  }, [dispatch, rangeParams]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const rangeChips = useMemo(
    () =>
      (['7d', '30d', 'thisMonth', 'lastMonth'] as const).map(id => ({
        id,
        label: t(`dashboard.range.${id}`),
      })),
    [t],
  );

  const byStatus = dashboard?.sales_performance.orders.by_status ?? {};
  const awaiting = byStatus.pending ?? 0;
  const inProgress = statusCount(byStatus, 'confirmed', 'packing');
  const readyToShip = byStatus.ready_to_ship ?? 0;
  const revenue = formatRevenueFromApi(
    dashboard?.sales_performance.revenue.total_by_currency ?? [],
  );
  const totalOrders = dashboard?.sales_performance.orders.total ?? 0;
  const fulfillmentRate = dashboard?.sales_performance.orders.fulfillment_rate;
  const cancelled = byStatus.cancelled ?? 0;
  const inventoryValue = dashboard?.inventory_summary.total_value ?? null;
  const totalSkus = dashboard?.inventory_summary.total_skus ?? 0;
  const totalItems = dashboard?.inventory_summary.total_items ?? 0;

  const statusRows = useMemo(() => {
    const entries = Object.entries(byStatus).filter(([, count]) => count > 0);
    entries.sort((a, b) => b[1] - a[1]);
    return entries;
  }, [byStatus]);

  const displayName = user?.name?.trim() || t('header.userDefault');
  const greeting = t(greetingKeyForHour(new Date().getHours()));

  const fulfillmentLabel =
    fulfillmentRate == null || !Number.isFinite(fulfillmentRate)
      ? '—'
      : `${Math.round(fulfillmentRate <= 1 ? fulfillmentRate * 100 : fulfillmentRate)}%`;

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ListLoadingGate loading={loading} itemCount={dashboard ? 1 : 0} refreshing={refreshing}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={sellerChromeScrollContent({
            paddingBottom: insets.bottom + 24,
          })}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadDashboard}
              tintColor={palette.textSecondary}
            />
          }
        >
          <View style={styles.hero}>
            <Text style={styles.greeting}>
              {greeting}, {displayName}
            </Text>
            <Text style={styles.subtitle}>{t('dashboard.subtitleSeller')}</Text>
          </View>

          <SellerChromeFilterChips
            chips={rangeChips}
            active={rangeKey}
            onSelect={setRangeKey}
          />

          {error ? (
            <Text style={styles.errorText} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}

          <CanvasListStatsBand>
            <View style={compactStatMetricRowStyles.row}>
              <CompactStatMetric
                style={compactStatMetricRowStyles.cell}
                value={awaiting}
                label={t('dashboard.sellerTile.awaiting')}
                tone="warning"
              />
              <CompactStatMetric
                style={compactStatMetricRowStyles.cell}
                value={inProgress}
                label={t('dashboard.sellerTile.inProgress')}
                tone="info"
              />
              <CompactStatMetric
                style={compactStatMetricRowStyles.cell}
                value={readyToShip}
                label={t('dashboard.sellerTile.readyToShip')}
                tone="success"
              />
              <CompactStatMetric
                style={compactStatMetricRowStyles.cell}
                value={revenue}
                label={t('dashboard.sellerTile.revenue')}
                tone="neutral"
              />
            </View>
          </CanvasListStatsBand>

          <View style={canvasStyles.dashboardPanel}>
            <Text style={canvasStyles.dashboardPanelTitle}>
              {t('dashboard.seller.salesOverview')}
            </Text>
            <View style={styles.metricGrid}>
              <View style={styles.metricCell}>
                <Text style={styles.metricValue}>{totalOrders}</Text>
                <Text style={styles.metricLabel}>{t('dashboard.seller.totalOrders')}</Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricValue}>{fulfillmentLabel}</Text>
                <Text style={styles.metricLabel}>
                  {t('dashboard.seller.fulfillmentRate')}
                </Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricValue}>
                  {inventoryValue == null
                    ? '—'
                    : formatMoneyVndNumber(inventoryValue, 0)}
                </Text>
                <Text style={styles.metricLabel}>
                  {t('dashboard.seller.inventoryValue')}
                </Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricValue}>
                  {totalSkus} / {totalItems}
                </Text>
                <Text style={styles.metricLabel}>
                  {t('dashboard.seller.totalSkuItems')}
                </Text>
              </View>
            </View>
            {cancelled > 0 ? (
              <Text style={styles.cancelledHint}>
                {t('dashboard.seller.cancelledInPeriod', { count: cancelled })}
              </Text>
            ) : null}
          </View>

          <CanvasListSection>
            <SectionTitle label={t('dashboard.seller.ordersByStatus')} />
            {statusRows.length === 0 ? (
              <View style={canvasStyles.placeholderCard}>
                <Text style={canvasStyles.placeholderHint}>
                  {t('dashboard.noOrderData')}
                </Text>
              </View>
            ) : (
              <View style={styles.statusList}>
                {statusRows.map(([status, count]) => (
                  <View key={status} style={styles.statusRow}>
                    <Text style={styles.statusLabel} numberOfLines={1}>
                      {t(orderStatusLabelKey(status), { defaultValue: status })}
                    </Text>
                    <Text style={styles.statusCount}>{count}</Text>
                  </View>
                ))}
              </View>
            )}
          </CanvasListSection>
        </ScrollView>
      </ListLoadingGate>
    </View>
  );
}

function createSellerDashboardScreenStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      flex: 1,
    },
    hero: {
      marginBottom: 8,
      gap: 4,
    },
    greeting: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 20,
    },
    errorText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.red,
      marginBottom: 8,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    metricCell: {
      width: '47%',
      minWidth: 120,
      gap: 2,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textPrimary,
    },
    metricLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    cancelledHint: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    statusList: {
      gap: 8,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.borderMid,
    },
    statusLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.textPrimary,
      marginRight: 12,
    },
    statusCount: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
    },
  });
}
