import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  transferOrderDetailTabsForAppRole,
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
import { SystemIcon, type SystemIconName } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { transferOrderStatusLabel } from '@mappers/warehouse/transferOrderMappers';
import { getTransferOrderDetail } from '@services/warehouse/transferOrderAPI';
import type { TransferOrderApi } from '@services/warehouse/transferOrderApiTypes';
import type { TransferOrderDetailTabId } from './transferOrderDetail/transferOrderDetailTypes';
import {
  TransferOrderDetailOverviewSection,
  TransferOrderDetailQuickDock,
} from './transferOrderDetail/TransferOrderDetailScrollFooter';
import { TransferOrderDetailTabBar } from './transferOrderDetail/TransferOrderDetailTabBar';
import { TransferOrderDetailTabPanels } from './transferOrderDetail/TransferOrderDetailTabPanels';

export type TransferOrderDetailScreenProps = {
  transferOrderRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
  onOpenOutboundOrder?: (orderNumber: string) => void;
  onOpenInboundOrder?: (orderNumber: string) => void;
  onOpenSaleOrder?: (orderNumber: string) => void;
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

function formatWeightG(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n <= 0) {
    return '—';
  }
  return `${n.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} g`;
}

const COMPLETED_TRANSFER_BANNER =
  'Chuyển kho hoàn tất. Tồn kho đã được cập nhật.';

function pillConfigForStatus(
  status: string | null | undefined,
  c: AppColorPalette,
): {
  paint: { bg: string; border: string };
  icon: SystemIconName;
  iconColor: string;
} {
  const s = (status ?? '').toLowerCase().trim();
  if (s === 'pending') {
    return {
      paint: { bg: 'rgba(245,158,11,0.18)', border: c.orange },
      icon: 'info',
      iconColor: c.orange,
    };
  }
  if (s === 'in_transit' || s === 'receiving') {
    return {
      paint: { bg: 'rgba(59,130,246,0.18)', border: '#3b82f6' },
      icon: 'info',
      iconColor: '#3b82f6',
    };
  }
  if (s === 'completed') {
    return {
      paint: { bg: 'rgba(16,185,129,0.2)', border: c.green },
      icon: 'checkCircle',
      iconColor: c.green,
    };
  }
  if (s === 'cancelled') {
    return {
      paint: { bg: 'rgba(239,68,68,0.15)', border: c.red },
      icon: 'info',
      iconColor: c.red,
    };
  }
  return {
    paint: { bg: c.bgButton, border: c.border },
    icon: 'info',
    iconColor: c.textMuted,
  };
}

export function TransferOrderDetailScreen({
  transferOrderRef,
  onOpenDrawer,
  onBack,
  onOpenOutboundOrder,
  onOpenInboundOrder,
  onOpenSaleOrder,
}: TransferOrderDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_TransferOrderDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );
  const insets = useSafeAreaInsets();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const detailTabs = useMemo(
    () => transferOrderDetailTabsForAppRole(appRole),
    [appRole],
  );

  const [t, setT] = useState<TransferOrderApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TransferOrderDetailTabId>('info');

  useEffect(() => {
    setActiveTab(prev => coerceDetailActiveTabId(prev, detailTabs, 'info'));
  }, [detailTabs]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getTransferOrderDetail(transferOrderRef.trim());
      setT(data);
    } catch (e: unknown) {
      setT(null);
      setError(
        e instanceof Error ? e.message : 'Không tải được lệnh chuyển kho',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [transferOrderRef]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const statusLabel = useMemo(
    () => transferOrderStatusLabel(t?.status ?? null),
    [t?.status],
  );
  const completedBanner = useMemo(() => {
    const s = (t?.status ?? '').toLowerCase().trim();
    return s === 'completed' ? COMPLETED_TRANSFER_BANNER : null;
  }, [t?.status]);
  const pillCfg = useMemo(
    () => pillConfigForStatus(t?.status ?? null, palette),
    [t?.status, palette],
  );

  const fromName = t?.from_warehouse?.name?.trim() || '—';
  const toName = t?.to_warehouse?.name?.trim() || '—';

  const outboundCount = useMemo(() => {
    const n = (t?.outbound_orders ?? []).length;
    return n > 0 ? n : toNum(t?.outbound_orders_count);
  }, [t?.outbound_orders, t?.outbound_orders_count]);

  const inboundCount = useMemo(() => {
    const n = (t?.inbound_orders ?? []).length;
    return n > 0 ? n : toNum(t?.inbound_orders_count);
  }, [t?.inbound_orders, t?.inbound_orders_count]);

  const boxCount = useMemo(
    () => toNum(t?.total_boxes_count),
    [t?.total_boxes_count],
  );

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
          Chuyển kho
          {t?.order_number ? ` · ${t.order_number}` : ' · Chi tiết'}
        </Text>

        {loading && !t ? (
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
                <Text style={styles.retryTxt}>Thử lại</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : t ? (
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
                  title={t.order_number?.trim() || `#${t.id}`}
                  subtitle={`Từ: ${fromName} → Đến: ${toName}`}
                  healthLabel="Hàng hóa"
                  healthValue={`${toNum(t.total_items)} SP · ${toNum(t.total_quantity)} SL`}
                  statusSlot={
                    <View style={styles.pillRow}>
                      <View
                        style={[
                          styles.pill,
                          {
                            backgroundColor: pillCfg.paint.bg,
                            borderColor: pillCfg.paint.border,
                          },
                        ]}
                      >
                        <SystemIcon
                          name={pillCfg.icon}
                          size={14}
                          color={pillCfg.iconColor}
                        />
                        <Text style={[styles.pillTxt, styles.pillTxtWithIcon]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                  }
                  footer={
                    <View style={styles.metaRow}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaChipTxt}>
                          {formatWeightG(t.total_weight)}
                        </Text>
                      </View>
                    </View>
                  }
                />

                {completedBanner ? (
                  <View style={styles.successBanner}>
                    <SystemIcon
                      name="checkCircle"
                      size={18}
                      color={palette.green}
                    />
                    <Text style={styles.successBannerTxt}>
                      {completedBanner}
                    </Text>
                  </View>
                ) : null}

                <TransferOrderDetailOverviewSection t={t} />

                <TransferOrderDetailTabBar
                  tabs={detailTabs}
                  activeTab={activeTab}
                  outboundCount={outboundCount}
                  boxCount={boxCount}
                  inboundCount={inboundCount}
                  onSelectTab={setActiveTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <TransferOrderDetailTabPanels
                    activeTab={activeTab}
                    t={t}
                    statusLabel={statusLabel}
                    onOpenOutboundOrder={onOpenOutboundOrder}
                    onOpenInboundOrder={onOpenInboundOrder}
                    onOpenSaleOrder={onOpenSaleOrder}
                  />
                </View>

                <View style={dockInScroll.section}>
                  <TransferOrderDetailQuickDock />
                </View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function create_TransferOrderDetailScreen_styles(c: AppColorPalette) {
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
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
    },
    pillTxt: { fontSize: 12, fontWeight: '800', color: c.textPrimary },
    pillTxtWithIcon: { marginLeft: 0 },
    routeLine: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      lineHeight: 19,
      marginBottom: 10,
    },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    metaChip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
    },
    metaChipTxt: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
    successBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(16,185,129,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(16,185,129,0.35)',
    },
    successBannerTxt: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 18,
    },
  });
}
