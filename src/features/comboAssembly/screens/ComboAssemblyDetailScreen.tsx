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
  comboAssemblyDetailTabsForAppRole,
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
import { formatComboAssemblyQuantity } from '@mappers/warehouse/comboAssemblyMappers';
import { getComboAssemblyDetail } from '@services/warehouse/comboAssemblyAPI';
import type { ComboAssemblyApi } from '@services/warehouse/comboAssemblyApiTypes';
import type { ComboAssemblyDetailTabId } from './comboAssemblyDetail/comboAssemblyDetailTypes';
import {
  ComboAssemblyDetailOverviewSection,
  ComboAssemblyDetailQuickDock,
} from './comboAssemblyDetail/ComboAssemblyDetailScrollFooter';
import { ComboAssemblyDetailTabBar } from './comboAssemblyDetail/ComboAssemblyDetailTabBar';
import { ComboAssemblyDetailTabPanels } from './comboAssemblyDetail/ComboAssemblyDetailTabPanels';

export type ComboAssemblyDetailScreenProps = {
  assemblyRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
};

function formatDateViDateOnly(iso: string | null | undefined): string {
  if (!iso?.trim()) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso.slice(0, 10);
  }
  return d.toLocaleDateString('vi-VN');
}

function statusLabelFor(a: ComboAssemblyApi | null): string {
  if (!a) {
    return '—';
  }
  const fromApi = (a.status_label ?? '').trim();
  if (fromApi) {
    return fromApi;
  }
  const s = (a.status ?? '').toLowerCase().trim();
  if (s === 'requested') {
    return 'Chờ xử lý';
  }
  if (s === 'completed') {
    return 'Đã đóng gói';
  }
  if (s === 'cancelled') {
    return 'Đã hủy';
  }
  return '—';
}

function pillConfigForComboStatus(
  status: string | null | undefined,
  c: AppColorPalette,
): {
  paint: { bg: string; border: string };
  icon: SystemIconName;
  iconColor: string;
} {
  const s = (status ?? '').toLowerCase().trim();
  if (s === 'requested') {
    return {
      paint: { bg: 'rgba(245,158,11,0.18)', border: c.orange },
      icon: 'info',
      iconColor: c.orange,
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
      icon: 'close',
      iconColor: c.red,
    };
  }
  return {
    paint: { bg: c.bgButton, border: c.border },
    icon: 'info',
    iconColor: c.textMuted,
  };
}

function warehouseMetaLine(a: ComboAssemblyApi): string {
  const w = a.warehouse;
  const code = w?.code?.trim();
  const name = w?.name?.trim();
  if (code && name) {
    return `${code} — ${name}`;
  }
  return name || code || '—';
}

export function ComboAssemblyDetailScreen({
  assemblyRef,
  onOpenDrawer,
  onBack,
}: ComboAssemblyDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ComboAssemblyDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );
  const insets = useSafeAreaInsets();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const detailTabs = useMemo(
    () => comboAssemblyDetailTabsForAppRole(appRole),
    [appRole],
  );

  const [a, setA] = useState<ComboAssemblyApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ComboAssemblyDetailTabId>('info');

  useEffect(() => {
    setActiveTab(prev => coerceDetailActiveTabId(prev, detailTabs, 'info'));
  }, [detailTabs]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getComboAssemblyDetail(assemblyRef.trim());
      setA(data);
    } catch (e: unknown) {
      setA(null);
      setError(
        e instanceof Error ? e.message : 'Không tải được lệnh đóng gói combo',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assemblyRef]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const statusLabel = useMemo(() => statusLabelFor(a), [a]);
  const pillCfg = useMemo(
    () => pillConfigForComboStatus(a?.status ?? null, palette),
    [a?.status, palette],
  );

  const materialsCount = useMemo(() => {
    const raw = a?.recipe_components;
    return Array.isArray(raw) ? raw.length : 0;
  }, [a?.recipe_components]);

  const qtyDisplay = `${formatComboAssemblyQuantity(a?.quantity ?? null)} đơn vị`;

  const productSubtitle = useMemo(() => {
    const sku = a?.product?.sku?.trim();
    const name = a?.product?.name?.trim();
    if (sku && name) {
      return `${sku} — ${name}`;
    }
    return name || sku || '—';
  }, [a?.product?.sku, a?.product?.name]);

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
          Đóng gói combo
          {a?.assembly_number ? ` · ${a.assembly_number}` : ' · Chi tiết'}
        </Text>

        {loading && !a ? (
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
        ) : a ? (
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
                  title={a.assembly_number?.trim() || `#${a.id}`}
                  subtitle={productSubtitle}
                  healthLabel="Kho"
                  healthValue={warehouseMetaLine(a)}
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
                  <View style={styles.metaChipRow}>
                    <View style={styles.metaChip}>
                      <SystemIcon
                        name="business"
                        size={14}
                        color={palette.textMuted}
                      />
                      <Text style={styles.metaChipTxt} numberOfLines={2}>
                        {warehouseMetaLine(a)}
                      </Text>
                    </View>
                    <View style={styles.metaChip}>
                      <SystemIcon
                        name="cube"
                        size={14}
                        color={palette.textMuted}
                      />
                      <Text style={styles.metaChipTxt} numberOfLines={2}>
                        {qtyDisplay}
                      </Text>
                    </View>
                    <View style={styles.metaChip}>
                      <SystemIcon
                        name="calendar"
                        size={14}
                        color={palette.textMuted}
                      />
                      <Text style={styles.metaChipTxt}>
                        {formatDateViDateOnly(a.created_at)}
                      </Text>
                    </View>
                  </View>
                  }
                />

                <ComboAssemblyDetailOverviewSection a={a} />

                <ComboAssemblyDetailTabBar
                  tabs={detailTabs}
                  activeTab={activeTab}
                  materialsCount={materialsCount}
                  onSelectTab={setActiveTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <ComboAssemblyDetailTabPanels
                    activeTab={activeTab}
                    a={a}
                    statusLabel={statusLabel}
                  />
                </View>

                <View style={dockInScroll.section}>
                  <ComboAssemblyDetailQuickDock />
                </View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function create_ComboAssemblyDetailScreen_styles(c: AppColorPalette) {
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
    productLine: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      lineHeight: 19,
      marginBottom: 10,
    },
    metaChipRow: { flexDirection: 'column', gap: 8 },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
    },
    metaChipTxt: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
    },
  });
}
