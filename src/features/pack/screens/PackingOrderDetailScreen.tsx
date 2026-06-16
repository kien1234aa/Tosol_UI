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
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  packingOrderDetailTabsForAppRole,
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
import { packingOrderStatusLabel } from '@mappers/warehouse/packingMappers';
import { getPackingOrderDetail } from '@services/warehouse/packingOrderAPI';
import type { PackingOrderApi } from '@services/warehouse/packingOrderApiTypes';
import type { PackingOrderDetailTabId } from './packingOrderDetail/packingOrderDetailTypes';
import {
  PackingOrderDetailOverviewSection,
  PackingOrderDetailQuickDock,
} from './packingOrderDetail/PackingOrderDetailScrollFooter';
import { PackingOrderDetailTabBar } from './packingOrderDetail/PackingOrderDetailTabBar';
import { PackingOrderDetailTabPanels } from './packingOrderDetail/PackingOrderDetailTabPanels';

export type PackingOrderDetailScreenProps = {
  packingOrderRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Bấm mã đơn bán — đóng overlay đóng gói và mở chi tiết đơn hàng. */
  onOpenSaleOrder?: (orderNumber: string) => void;
};

function toNum(v: number | string | null | undefined, fb = 0): number {
  if (v == null) {
    return fb;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : fb;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function statusBannerMessage(po: PackingOrderApi): string | null {
  const s = (po.status ?? '').toLowerCase().trim();
  if (s === 'pending') {
    return 'Nhấn Bắt đầu đóng gói trên web quản lý kho để xử lý đơn hàng.';
  }
  if (s === 'packing') {
    return 'Đơn đang được đóng gói tại kho.';
  }
  if (s === 'completed') {
    return 'Lệnh đóng gói đã hoàn tất.';
  }
  if (s === 'cancelled') {
    return 'Lệnh đóng gói đã hủy.';
  }
  return null;
}

function pillStyleForStatus(
  status: string | null | undefined,
  c: AppColorPalette,
): { bg: string; border: string } {
  const s = (status ?? '').toLowerCase().trim();
  if (s === 'pending') {
    return { bg: 'rgba(245,158,11,0.18)', border: c.orange };
  }
  if (s === 'packing') {
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

export function PackingOrderDetailScreen({
  packingOrderRef,
  onOpenDrawer,
  onBack,
  onOpenSaleOrder,
}: PackingOrderDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_PackingOrderDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );
  const insets = useSafeAreaInsets();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const detailTabs = useMemo(
    () => packingOrderDetailTabsForAppRole(appRole),
    [appRole],
  );

  const [po, setPo] = useState<PackingOrderApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PackingOrderDetailTabId>('info');

  useEffect(() => {
    setActiveTab(prev => coerceDetailActiveTabId(prev, detailTabs, 'info'));
  }, [detailTabs]);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getPackingOrderDetail(packingOrderRef.trim());
      setPo(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được lệnh đóng gói';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setPo(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [packingOrderRef, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const statusLabel = useMemo(
    () => packingOrderStatusLabel(po?.status ?? null),
    [po?.status],
  );
  const banner = useMemo(() => (po ? statusBannerMessage(po) : null), [po]);
  const pillPaint = useMemo(
    () => pillStyleForStatus(po?.status ?? null, palette),
    [po?.status, palette],
  );

  const pickPct = useMemo(
    () => clampPct(toNum(po?.pick_progress)),
    [po?.pick_progress],
  );
  const packPct = useMemo(
    () => clampPct(toNum(po?.packing_progress)),
    [po?.packing_progress],
  );
  const boxCount = useMemo(
    () => Math.max(0, toNum(po?.summary?.total_boxes, toNum(po?.box_count))),
    [po?.box_count, po?.summary?.total_boxes],
  );
  const packedBoxes = useMemo(
    () => toNum(po?.summary?.packed_boxes),
    [po?.summary?.packed_boxes],
  );

  const onQuickActionPress = useCallback((_key: string) => {
    toast.info('Thao tác kho (bắt đầu đóng gói, phân công, hủy…) hiện thực hiện trên web quản lý kho.');
  }, []);

  const openSaleOrder = useCallback(
    (orderNumber: string) => {
      const n = orderNumber.trim();
      if (!n || !onOpenSaleOrder) {
        return;
      }
      onOpenSaleOrder(n);
    },
    [onOpenSaleOrder],
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
          Đóng gói
          {po?.order_number ? ` · ${po.order_number}` : ' · Chi tiết'}
        </Text>

        {loading && !po ? (
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
              <Pressable onPress={() => void load(true)} style={styles.retryBtn}>
                <Text style={styles.retryTxt}>Thử lại</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : po ? (
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
                  title={po.order_number?.trim() || `#${po.id}`}
                  subtitle={po.warehouse?.name?.trim() || undefined}
                  healthLabel="Tiến độ đóng gói"
                  healthValue={`${packPct}%`}
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
                      {po.warehouse?.name ? (
                        <View style={[styles.pill, styles.pillWh]}>
                          <Text style={styles.pillTxt} numberOfLines={2}>
                            {po.warehouse.name}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  }
                  footer={
                    <View style={styles.metaRow}>
                      <View style={styles.metaItemRow}>
                        <SystemIcon
                          name="layers"
                          size={12}
                          color={palette.textMuted}
                        />
                        <Text style={styles.metaItem} numberOfLines={1}>
                          Lấy hàng: {pickPct}%
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

                <PackingOrderDetailOverviewSection
                  po={po}
                  pickPct={pickPct}
                  packPct={packPct}
                  totalBoxes={boxCount}
                  packedBoxes={packedBoxes}
                />

                <PackingOrderDetailTabBar
                  tabs={detailTabs}
                  activeTab={activeTab}
                  boxCount={boxCount}
                  onSelectTab={setActiveTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <PackingOrderDetailTabPanels
                    activeTab={activeTab}
                    po={po}
                    statusLabel={statusLabel}
                    onOpenSaleOrder={
                      onOpenSaleOrder ? openSaleOrder : undefined
                    }
                  />
                </View>

                <View style={dockInScroll.section}>
                  <PackingOrderDetailQuickDock
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

function create_PackingOrderDetailScreen_styles(c: AppColorPalette) {
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
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 8,
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
    pillWh: {
      backgroundColor: 'rgba(59,130,246,0.18)',
      borderColor: '#3b82f6',
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
