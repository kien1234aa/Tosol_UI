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
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  supplierDetailTabsForAppRole,
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
  DetailCard,
  DetailRow,
} from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { ProductStatusPill } from '../products/components/ProductStatusPill';
import type { SupplierApi } from '@services/category/supplierApiTypes';
import {
  activateSupplier,
  deactivateSupplier,
  deleteSupplier,
  getSupplier,
} from '@services/category/supplierAPI';
import {
  fetchCategorySuppliers,
  fetchCategorySupplierStats,
} from '@services/category/categorySupplierSlice';
import {
  SupplierDetailOverviewSection,
  SupplierDetailQuickDock,
} from './supplierDetail/SupplierDetailScrollFooter';
import { SupplierDetailPurchaseOrdersPanel } from './supplierDetail/SupplierDetailPurchaseOrdersPanel';
import { SupplierDetailTabBar } from './supplierDetail/SupplierDetailTabBar';
import type { SupplierDetailTabId } from './supplierDetail/supplierDetailTypes';
import { ModelActivityLogPanel } from '@shared/components/ui/ModelActivityLogPanel';
import { supplierActivityToRow } from '@mappers/category/supplierActivityMappers';

export type SupplierDetailScreenProps = {
  supplierId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  reloadSignal?: number;
  onEditSupplier?: (supplierId: number) => void;
  onOpenPurchaseOrder?: (orderRef: string) => void;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

function strOrDash(v: string | null | undefined): string {
  const t = (v ?? '').trim();
  return t.length > 0 ? t : '—';
}

function fmtPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) {
    return '—';
  }
  const d = phone.replace(/\D/g, '');
  if (d.length >= 10) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`.trim();
  }
  return phone.trim();
}

export function SupplierDetailScreen({
  supplierId,
  onOpenDrawer,
  onBack,
  reloadSignal = 0,
  onEditSupplier,
  onOpenPurchaseOrder,
}: SupplierDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_SupplierDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const supplierDetailTabs = useMemo(
    () => supplierDetailTabsForAppRole(appRole),
    [appRole],
  );
  const [s, setS] = useState<SupplierApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<SupplierDetailTabId>('info');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getSupplier(supplierId);
      setS(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được nhà cung cấp';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setS(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supplierId, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load, reloadSignal]);

  useEffect(() => {
    setTab(prev => coerceDetailActiveTabId(prev, supplierDetailTabs, 'info'));
  }, [supplierDetailTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const syncLists = useCallback(() => {
    void dispatch(fetchCategorySuppliers({}));
    void dispatch(fetchCategorySupplierStats());
  }, [dispatch]);

  const runDelete = useCallback(async () => {
    if (!s) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Xóa nhà cung cấp',
      message: `Xóa ${s.name}? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      destructive: true,
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    try {
      await deleteSupplier(s.id);
      toast.success(`Đã xóa nhà cung cấp ${s.name}.`);
      syncLists();
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, [s, onBack, syncLists]);

  const openEdit = useCallback(() => {
    if (!s) {
      return;
    }
    if (onEditSupplier) {
      onEditSupplier(s.id);
      return;
    }
    toast.info('Màn sửa sẽ bổ sung trên ứng dụng.');
  }, [s, onEditSupplier]);

  const runDeactivate = useCallback(async () => {
    if (!s) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Vô hiệu hóa',
      message: `Vô hiệu hóa nhà cung cấp ${s.name}?`,
      confirmText: 'Xác nhận',
      destructive: true,
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    try {
      const next = await deactivateSupplier(s.id);
      toast.success(`Đã vô hiệu hóa nhà cung cấp ${s.name}.`);
      setS(prev =>
        prev && prev.id === next.id ? { ...prev, ...next } : next,
      );
      syncLists();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, [s, syncLists]);

  const runActivate = useCallback(async () => {
    if (!s) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Kích hoạt',
      message: `Kích hoạt lại nhà cung cấp ${s.name}?`,
      confirmText: 'Xác nhận',
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    try {
      const next = await activateSupplier(s.id);
      toast.success(`Đã kích hoạt nhà cung cấp ${s.name}.`);
      setS(prev =>
        prev && prev.id === next.id ? { ...prev, ...next } : next,
      );
      syncLists();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, [s, syncLists]);

  const poCount = s?.purchase_orders_count ?? 0;

  const tabContent = useMemo(() => {
    if (!s) {
      return null;
    }
    if (tab === 'orders') {
      return (
        <SupplierDetailPurchaseOrdersPanel
          supplierId={s.id}
          reloadSignal={reloadSignal}
          onOpenPurchaseOrder={onOpenPurchaseOrder}
        />
      );
    }
    if (tab === 'stats') {
      return (
        <DetailCard title="Thống kê" icon="chart">
          <View style={styles.emptyInner}>
            <View style={styles.emptyIconSlot}>
              <SystemIcon name="chart" size={34} color={palette.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
            <Text style={styles.emptyHint}>
              Biểu đồ và chỉ số sẽ bổ sung khi API sẵn sàng.
            </Text>
          </View>
        </DetailCard>
      );
    }
    if (tab === 'activity') {
      return (
        <ModelActivityLogPanel
          modelType="Supplier"
          modelId={s.id}
          reloadSignal={reloadSignal}
          i18nPrefix="suppliers.detail"
          toRow={supplierActivityToRow}
        />
      );
    }

    const statusPill: 'active' | 'inactive' = s.is_active
      ? 'active'
      : 'inactive';
    return (
      <>
        <DetailCard title="Thông tin cơ bản" icon="info">
          <DetailRow label="Mã nhà cung cấp" value={strOrDash(s.code)} />
          <DetailRow label="Tên nhà cung cấp" value={s.name} />
          <View style={styles.grid2}>
            <View style={styles.gridCell}>
              <Text style={styles.detailLab}>Trạng thái</Text>
              <View style={styles.mt6}>
                <ProductStatusPill status={statusPill} />
              </View>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.detailLab}>Mã số thuế</Text>
              <Text style={[styles.detailValInline, styles.mt6]}>
                {strOrDash(s.tax_code)}
              </Text>
            </View>
          </View>
          <DetailRow label="Email" value={strOrDash(s.email)} />
          <DetailRow label="Điện thoại" value={fmtPhoneDisplay(s.phone)} />
          <DetailRow
            label="Người liên hệ"
            value={strOrDash(s.contact_person)}
          />
          <DetailRow label="Địa chỉ" value={strOrDash(s.address)} />
        </DetailCard>

        <DetailCard title="Hệ thống" icon="cube">
          <DetailRow label="Ngày tạo" value={fmtDate(s.created_at)} />
          <DetailRow label="Ngày cập nhật" value={fmtDate(s.updated_at)} />
          <DetailRow
            label="Đơn mua hàng"
            value={(s.purchase_orders_count ?? 0).toLocaleString('vi-VN')}
          />
        </DetailCard>
      </>
    );
  }, [s, tab, styles, reloadSignal, onOpenPurchaseOrder]);

  const heroTrailing = useMemo(
    () => (
      <View style={styles.heroThumbPh}>
        <SystemIcon name="business" size={26} color={palette.textMuted} />
      </View>
    ),
    [styles.heroThumbPh, palette.textMuted],
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
          Nhà cung cấp
          {s?.code != null && String(s.code).trim() !== ''
            ? ` · ${String(s.code).trim()}`
            : ''}
          {s?.name ? ` · ${s.name}` : ''}
        </Text>

        {loading && !s ? (
          <DetailScreenSkeleton />
        ) : error ? (
          <ScrollView
            style={detailScreenScrollFlex}
            contentContainerStyle={[
              canvasListScrollContent({ paddingHorizontal: 0 }),
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
        ) : s ? (
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
                  title={s.name}
                  subtitle={strOrDash(s.code)}
                  healthLabel="Liên hệ"
                  healthValue={fmtPhoneDisplay(s.phone)}
                  statusSlot={
                    <ProductStatusPill
                      status={s.is_active ? 'active' : 'inactive'}
                    />
                  }
                  trailing={heroTrailing}
                  footer={
                    <Text style={styles.heroMetaLine} numberOfLines={1}>
                      {strOrDash(s.email)}
                    </Text>
                  }
                />

                <SupplierDetailOverviewSection supplier={s} />

                <SupplierDetailTabBar
                  tabs={supplierDetailTabs}
                  activeTab={tab}
                  purchaseOrdersCount={s.purchase_orders_count ?? 0}
                  onSelectTab={setTab}
                />

                <View style={detailScreenTabPanelsPad}>{tabContent}</View>

                <View style={dockInScroll.section}>
                  <SupplierDetailQuickDock
                    supplier={s}
                    onEdit={openEdit}
                    onDeactivate={runDeactivate}
                    onActivate={runActivate}
                    onDelete={runDelete}
                    submitting={busy}
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

function create_SupplierDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
    tabBodyPad: { paddingBottom: 12 },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 6,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    breadcrumb: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 10,
      lineHeight: 18,
      paddingHorizontal: 16,
    },
    errBox: {
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
    heroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 10,
    },
    heroThumbPh: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTextCol: { flex: 1, minWidth: 0 },
    heroTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      lineHeight: 21,
    },
    heroSku: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
    },
    heroContact: { marginTop: 6, gap: 4 },
    heroMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
    },
    heroMetaLine: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    heroEdit: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      alignSelf: 'flex-start',
    },
    heroEditInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    heroEditTxt: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    grid2: {
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    gridCell: {
      flex: 1,
      minWidth: 0,
    },
    detailLab: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
    },
    detailValInline: {
      fontSize: 13,
      fontWeight: '700',
      color: c.tealLight,
    },
    mt6: { marginTop: 6 },
    panelHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 19,
      marginBottom: 12,
    },
    panelHintStrong: { fontWeight: '800', color: c.textPrimary },
    emptyInner: {
      alignItems: 'center',
      paddingVertical: 20,
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
  });
}
