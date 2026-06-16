import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  inboundOrderDetailTabsForAppRole,
} from '@features/auth/utils/roleNavPolicy';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import {
  createDetailQuickDockInScrollSectionStyles,
  detailScreenMainScrollContentTopPad,
  detailScreenScrollBottomInset,
  detailScreenTabPanelsPad,
} from '@shared/components/ui/detailScreenScrollDock';
import {
  detailScreenBody,
  detailScreenMainCol,
  detailScreenMainColumn,
  detailScreenRoot,
  detailScreenScrollFlex,
} from '@shared/components/ui/detailScreenLayout';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  inboundOrderStatusLabel,
  inboundOrderTypeLabel,
} from '@mappers/warehouse/inboundOrderMappers';
import { getInboundOrderDetail } from '@services/warehouse/inboundOrderAPI';
import type { InboundOrderApi } from '@services/warehouse/inboundOrderApiTypes';
import type { InboundOrderDetailTabId } from './inboundOrderDetail/inboundOrderDetailTypes';
import {
  InboundOrderDetailOverviewSection,
  InboundOrderDetailQuickDock,
} from './inboundOrderDetail/InboundOrderDetailScrollFooter';
import { InboundOrderDetailTabBar } from './inboundOrderDetail/InboundOrderDetailTabBar';
import { InboundOrderDetailTabPanels } from './inboundOrderDetail/InboundOrderDetailTabPanels';

export type InboundOrderDetailScreenProps = {
  inboundOrderRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
  onOpenSaleOrder?: (orderNumber: string) => void;
  onOpenPurchaseOrder?: (orderRef: string) => void;
};

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function pillStyleForStatus(
  status: string | null | undefined,
  c: AppColorPalette,
): { bg: string; border: string } {
  const s = (status ?? '').toLowerCase().trim();
  if (s === 'pending') {
    return { bg: 'rgba(245,158,11,0.18)', border: c.orange };
  }
  if (s === 'receiving') {
    return { bg: 'rgba(59,130,246,0.18)', border: '#3b82f6' };
  }
  if (s === 'completed') {
    return { bg: 'rgba(16,185,129,0.2)', border: c.green };
  }
  if (s === 'cancelled') {
    return { bg: 'rgba(239,68,68,0.15)', border: c.red };
  }
  return { bg: c.bgButton, border: c.border };
}

export function InboundOrderDetailScreen({
  inboundOrderRef,
  onOpenDrawer,
  onBack,
  onOpenSaleOrder,
  onOpenPurchaseOrder,
}: InboundOrderDetailScreenProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_InboundOrderDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );
  const insets = useSafeAreaInsets();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const detailTabs = useMemo(
    () => inboundOrderDetailTabsForAppRole(appRole),
    [appRole],
  );

  const [o, setO] = useState<InboundOrderApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InboundOrderDetailTabId>('info');

  useEffect(() => {
    setActiveTab(prev => coerceDetailActiveTabId(prev, detailTabs, 'info'));
  }, [detailTabs]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getInboundOrderDetail(inboundOrderRef.trim());
      setO(data);
    } catch (e: unknown) {
      setO(null);
      setError(
        e instanceof Error
          ? e.message
          : t('warehouseInbound.detail.loadFailed'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [inboundOrderRef, t]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const statusLabel = useMemo(
    () => inboundOrderStatusLabel(o?.status ?? null),
    [o?.status],
  );
  const typeLabel = useMemo(() => (o ? inboundOrderTypeLabel(o) : ''), [o]);
  const banner = useMemo(() => {
    if (!o) {
      return null;
    }
    const s = (o.status ?? '').toLowerCase().trim();
    if (s === 'pending') {
      return t('warehouseInbound.banner.pending');
    }
    if (s === 'receiving') {
      return t('warehouseInbound.banner.receiving');
    }
    if (s === 'completed') {
      return t('warehouseInbound.banner.completed');
    }
    if (s === 'cancelled') {
      return t('warehouseInbound.banner.cancelled');
    }
    return null;
  }, [o, t]);
  const pillPaint = useMemo(
    () => pillStyleForStatus(o?.status ?? null, palette),
    [o?.status, palette],
  );

  const receivePct = useMemo(() => {
    if (!o) {
      return 0;
    }
    const exp = toNum(o.total_expected_quantity);
    const rec = toNum(o.total_received_quantity);
    if (exp > 0) {
      return clampPct((rec / exp) * 100);
    }
    if (o.is_fully_received) {
      return 100;
    }
    return 0;
  }, [o]);

  const inboundLines = o?.items ?? [];
  const inboundLineCount = inboundLines.length;
  const poLineCount = o?.purchase_order?.items?.length ?? 0;

  const onQuickActionPress = useCallback(() => {
    toast.info(t('warehouseInbound.detail.warehouseWebOnly'));
  }, [t]);

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
      />
    ),
    [refreshing, onRefresh, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <View style={detailScreenMainCol}>
        <Text style={styles.breadcrumb} numberOfLines={2}>
          {t('warehouseInbound.detail.breadcrumb')}
          {o?.order_number
            ? ` · ${o.order_number}`
            : t('warehouseInbound.detail.fallbackTitle')}
        </Text>

        {loading && !o ? (
          <DetailScreenSkeleton />
        ) : error ? (
          <ScrollView
            style={detailScreenScrollFlex}
            contentContainerStyle={[ canvasListScrollContent(),
              { paddingBottom: insets.bottom + 24 },
            ]}
            nestedScrollEnabled
          >
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{error}</Text>
              <Pressable onPress={() => void load()} style={styles.retryBtn}>
                <Text style={styles.retryTxt}>{t('common.retry')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : o ? (
          <View style={detailScreenBody}>
            <View style={detailScreenMainColumn}>
              <DetailScreenTabScroll
                style={detailScreenScrollFlex}
                contentContainerStyle={[
                  detailScreenMainScrollContentTopPad,
                  {
                    paddingBottom: detailScreenScrollBottomInset(insets.bottom),
                  },
                ]}
                refreshControl={memoizedRefreshControl}
              >
                <CanvasDetailHeroCard
                  title={o.order_number?.trim() || `#${o.id}`}
                  subtitle={o.warehouse?.name?.trim() || undefined}
                  healthLabel={t('warehouseInbound.footer.receiveProgress')}
                  healthValue={`${receivePct}%`}
                  statusSlot={
                    <View style={styles.pillRow}>
                      <View
                        style={[
                          styles.pill,
                          {
                            backgroundColor: pillPaint.bg,
                            borderColor: pillPaint.border,
                          },
                        ]}
                      >
                        <Text style={styles.pillTxt}>{statusLabel}</Text>
                      </View>
                      <View style={[styles.pill, styles.pillType]}>
                        <Text style={styles.pillTxt} numberOfLines={1}>
                          {typeLabel}
                        </Text>
                      </View>
                    </View>
                  }
                />

                {banner ? (
                  <View style={styles.infoBanner}>
                    <SystemIcon name="info" size={18} color={palette.blue} />
                    <Text style={styles.infoBannerTxt}>{banner}</Text>
                  </View>
                ) : null}

                <InboundOrderDetailOverviewSection
                  o={o}
                  receivePct={receivePct}
                  inboundLineCount={inboundLineCount}
                />

                <InboundOrderDetailTabBar
                  tabs={detailTabs}
                  activeTab={activeTab}
                  inboundLineCount={inboundLineCount}
                  poLineCount={poLineCount}
                  onSelectTab={setActiveTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <InboundOrderDetailTabPanels
                    activeTab={activeTab}
                    o={o}
                    statusLabel={statusLabel}
                    receivePct={receivePct}
                    onOpenSaleOrder={onOpenSaleOrder}
                    onOpenPurchaseOrder={onOpenPurchaseOrder}
                  />
                </View>

                <View style={dockInScroll.section}>
                  <InboundOrderDetailQuickDock
                    onQuickActionPress={onQuickActionPress}
                  />
                </View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function create_InboundOrderDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
    tabBodyPad: { paddingBottom: 12 },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      marginTop: 4,
      marginBottom: 8,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    breadcrumb: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 4,
      lineHeight: 18,
      paddingHorizontal: 16,
    },
    errBox: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 14, fontWeight: '600', color: c.red, marginBottom: 12 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.cyan },
    hero: {
      marginHorizontal: 16,
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
      marginBottom: 8,
    },
    heroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    orderNo: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
    },
    heroSub: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      marginTop: 4,
      marginBottom: 6,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 4,
    },
    metaItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      maxWidth: '100%',
    },
    metaItem: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      flexShrink: 1,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      maxWidth: '100%',
    },
    pillType: {
      backgroundColor: 'rgba(139,92,246,0.15)',
      borderColor: '#8b5cf6',
    },
    pillTxt: { fontSize: 12, fontWeight: '800', color: c.textPrimary },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 10,
      backgroundColor: c.blueBg,
      borderWidth: 1,
      borderColor: 'rgba(96,165,250,0.35)',
    },
    infoBannerTxt: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 18,
    },
  });
}
