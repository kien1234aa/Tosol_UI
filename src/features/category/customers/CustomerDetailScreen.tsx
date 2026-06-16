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
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  customerDetailTabsForAppRole,
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
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import type { CustomerDetailApi } from '@services/category/customerApiTypes';
import {
  deleteCustomer,
  getCustomer,
} from '@services/category/customerAPI';
import { fetchCustomerList } from '@services/category/customerListSlice';
import {
  CustomerDetailOverviewSection,
  CustomerDetailQuickDock,
} from './customerDetail/CustomerDetailScrollFooter';
import { CustomerDetailTabBar } from './customerDetail/CustomerDetailTabBar';
import { CustomerDetailSaleOrdersPanel } from './customerDetail/CustomerDetailSaleOrdersPanel';
import type { CustomerDetailTabId } from './customerDetail/customerDetailTypes';
import { ModelActivityLogPanel } from '@shared/components/ui/ModelActivityLogPanel';
import { customerActivityToRow } from '@mappers/category/customerActivityMappers';

function customerStrOrDash(v: string | null | undefined): string {
  const t = (v ?? '').trim();
  return t.length > 0 ? t : '—';
}

function customerAddressLine(c: CustomerDetailApi): string {
  const fa = (c.full_address ?? '').trim();
  if (fa.length > 0) {
    return fa;
  }
  return customerStrOrDash(c.address);
}

function customerSellerLabel(c: CustomerDetailApi): string {
  const s = c.seller;
  if (s && typeof s === 'object') {
    const n = typeof s.name === 'string' ? s.name.trim() : '';
    if (n.length > 0) {
      return n;
    }
  }
  return '—';
}

type CustomerDetailFieldStyles = {
  fieldBlock: ViewStyle;
  fieldLab: TextStyle;
  fieldVal: TextStyle;
};

function CustomerDetailFieldBlock({
  label,
  value,
  styles: fieldStyles,
}: {
  label: string;
  value: string;
  styles: CustomerDetailFieldStyles;
}) {
  return (
    <View style={fieldStyles.fieldBlock}>
      <Text style={fieldStyles.fieldLab}>{label}</Text>
      <Text style={fieldStyles.fieldVal} numberOfLines={4}>
        {value}
      </Text>
    </View>
  );
}

export type CustomerDetailScreenProps = {
  customerId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  reloadSignal?: number;
  onEditCustomer?: (customerId: number) => void;
  onOpenOrder?: (orderRef: string) => void;
};

export function CustomerDetailScreen({
  customerId,
  onOpenDrawer,
  onBack,
  reloadSignal = 0,
  onEditCustomer,
  onOpenOrder,
}: CustomerDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_CustomerDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );
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

  function fmtDateTime(iso: string | null | undefined): string {
    if (!iso) {
      return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return '—';
    }
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const customerDetailTabs = useMemo(
    () => customerDetailTabsForAppRole(appRole),
    [appRole],
  );
  const [c, setC] = useState<CustomerDetailApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CustomerDetailTabId>('info');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getCustomer(customerId);
      setC(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được khách hàng';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setC(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load, reloadSignal]);

  useEffect(() => {
    setTab(prev => coerceDetailActiveTabId(prev, customerDetailTabs, 'info'));
  }, [customerDetailTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const syncLists = useCallback(() => {
    void dispatch(fetchCustomerList({ page: 1 }));
  }, [dispatch]);

  const openEdit = useCallback(() => {
    if (!c) {
      return;
    }
    if (onEditCustomer) {
      onEditCustomer(c.id);
      return;
    }
    toast.info('Màn sửa sẽ bổ sung trên ứng dụng.');
  }, [c, onEditCustomer]);

  const runDelete = useCallback(async () => {
    if (!c) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Xóa khách hàng',
      message: `Xóa ${c.name}? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      destructive: true,
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    try {
      const deletedName = c.name;
      await deleteCustomer(c.id);
      syncLists();
      onBack();
      toast.success(`${deletedName} đã được xóa khỏi danh sách.`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, [c, onBack, syncLists]);

  const tabContent = useMemo(() => {
    if (!c) {
      return null;
    }
    if (tab === 'orders') {
      return (
        <CustomerDetailSaleOrdersPanel
          customerId={c.id}
          reloadSignal={reloadSignal}
          onOpenOrder={onOpenOrder}
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
          modelType="Customer"
          modelId={c.id}
          reloadSignal={reloadSignal}
          i18nPrefix="customers.detail"
          toRow={customerActivityToRow}
        />
      );
    }

    return (
      <DetailCard title="Thông tin cơ bản" icon="info">
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <CustomerDetailFieldBlock
              label="Tên khách hàng"
              value={c.name}
              styles={{
                fieldBlock: styles.fieldBlock,
                fieldLab: styles.fieldLab,
                fieldVal: styles.fieldVal,
              }}
            />
            <CustomerDetailFieldBlock
              label="Điện thoại"
              value={fmtPhoneDisplay(c.phone)}
              styles={{
                fieldBlock: styles.fieldBlock,
                fieldLab: styles.fieldLab,
                fieldVal: styles.fieldVal,
              }}
            />
            <CustomerDetailFieldBlock
              label="Tổng số đơn hàng"
              value={(c.sale_orders_count ?? 0).toLocaleString('vi-VN')}
              styles={{
                fieldBlock: styles.fieldBlock,
                fieldLab: styles.fieldLab,
                fieldVal: styles.fieldVal,
              }}
            />
            <CustomerDetailFieldBlock
              label="Địa chỉ"
              value={customerAddressLine(c)}
              styles={{
                fieldBlock: styles.fieldBlock,
                fieldLab: styles.fieldLab,
                fieldVal: styles.fieldVal,
              }}
            />
            <CustomerDetailFieldBlock
              label="Ngày tạo"
              value={fmtDateTime(c.created_at)}
              styles={{
                fieldBlock: styles.fieldBlock,
                fieldLab: styles.fieldLab,
                fieldVal: styles.fieldVal,
              }}
            />
          </View>
          <View style={styles.col}>
            <CustomerDetailFieldBlock
              label="Email"
              value={customerStrOrDash(c.email)}
              styles={{
                fieldBlock: styles.fieldBlock,
                fieldLab: styles.fieldLab,
                fieldVal: styles.fieldVal,
              }}
            />
            <CustomerDetailFieldBlock
              label="Quản lý Seller"
              value={customerSellerLabel(c)}
              styles={{
                fieldBlock: styles.fieldBlock,
                fieldLab: styles.fieldLab,
                fieldVal: styles.fieldVal,
              }}
            />
          </View>
        </View>
      </DetailCard>
    );
  }, [c, tab, reloadSignal, onOpenOrder, palette.textMuted, styles]);

  const heroSub = c?.phone?.trim() || c?.uuid || '—';

  const heroTrailing = useMemo(
    () => (
      <View style={styles.heroThumbPh}>
        <SystemIcon name="person" size={26} color={palette.textMuted} />
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
          Khách hàng
          {c?.name ? ` · ${c.name}` : ''}
        </Text>

        {loading && !c ? (
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
        ) : c ? (
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
                  title={c.name}
                  subtitle={heroSub}
                  healthLabel="Điện thoại"
                  healthValue={fmtPhoneDisplay(c.phone)}
                  trailing={heroTrailing}
                  footer={
                    <Text style={styles.heroMetaLine} numberOfLines={2}>
                      {customerAddressLine(c)}
                    </Text>
                  }
                />

                <CustomerDetailOverviewSection customer={c} />

                <CustomerDetailTabBar
                  tabs={customerDetailTabs}
                  activeTab={tab}
                  saleOrdersCount={c.sale_orders_count ?? 0}
                  onSelectTab={setTab}
                />

                <View style={detailScreenTabPanelsPad}>{tabContent}</View>

                <View style={dockInScroll.section}>
                  <CustomerDetailQuickDock
                    onEdit={openEdit}
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

function create_CustomerDetailScreen_styles(c: AppColorPalette) {
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
    twoCol: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'flex-start',
    },
    col: {
      flex: 1,
      minWidth: 0,
      gap: 12,
    },
    fieldBlock: {
      marginBottom: 2,
    },
    fieldLab: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 4,
    },
    fieldVal: {
      fontSize: 13,
      fontWeight: '700',
      color: c.tealLight,
      lineHeight: 18,
    },
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
