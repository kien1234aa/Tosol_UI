import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../../app/hooks';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import {
  detailScreenBody,
  detailScreenMainCol,
  detailScreenMainColumn,
  detailScreenRoot,
  detailScreenScrollFlex,
} from '@shared/components/ui/detailScreenLayout';
import {
  createDetailQuickDockInScrollSectionStyles,
  detailScreenMainScrollContentTopPad,
  detailScreenScrollBottomInset,
  detailScreenTabPanelsPad,
} from '@shared/components/ui/detailScreenScrollDock';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  DetailCard,
  DetailRow,
} from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { ProductStatusPill } from '../products/components/ProductStatusPill';
import {
  activatePriceList,
  deactivatePriceList,
  deletePriceList,
  getPriceListById,
  setPriceListAsDefault,
} from '@services/category/priceListAPI';
import type { PriceListApi } from '@services/category/priceListApiTypes';
import { fetchCategoryPriceLists } from '@services/category/categoryPriceListSlice';
import { PriceListDetailQuickDock } from './priceListDetail/PriceListDetailScrollFooter';
import { PriceListDetailProductPricesPanel } from './priceListDetail/PriceListDetailProductPricesPanel';
import { PriceListDetailTabBar } from './priceListDetail/PriceListDetailTabBar';
import type { PriceListDetailTabId } from './priceListDetail/priceListDetailTypes';

type PriceListCurrencyLineStyles = {
  currRow: ViewStyle;
  currDot: ViewStyle;
  currDollar: TextStyle;
  currLineTxt: TextStyle;
};

function PriceListCurrencyLine({
  code,
  name,
  styles: lineStyles,
}: {
  code: string;
  name: string;
  styles: PriceListCurrencyLineStyles;
}) {
  return (
    <View style={lineStyles.currRow}>
      <View style={lineStyles.currDot}>
        <Text style={lineStyles.currDollar}>$</Text>
      </View>
      <Text style={lineStyles.currLineTxt} numberOfLines={2}>
        {code}: {name}
      </Text>
    </View>
  );
}

export type PriceListDetailScreenProps = {
  priceListId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Tăng sau khi lưu sửa bảng giá để tải lại chi tiết. */
  reloadSignal?: number;
  onEditPriceList?: (priceListId: number) => void;
  onOpenProduct?: (productId: number) => void;
};

export function PriceListDetailScreen({
  priceListId,
  onOpenDrawer,
  onBack,
  reloadSignal = 0,
  onEditPriceList,
  onOpenProduct,
}: PriceListDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_PriceListDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );

  function fmtApiDateOnly(s: string | null | undefined): string {
    if (!s) {
      return '—';
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const parts = s.split('-');
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);
      if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
        return '—';
      }
      return new Date(y, m - 1, d).toLocaleDateString('vi-VN');
    }
    const t = new Date(s);
    return Number.isNaN(t.getTime()) ? '—' : t.toLocaleDateString('vi-VN');
  }

  function fmtDateTimeVi(iso: string | null | undefined): string {
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
  const [pl, setPl] = useState<PriceListApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<PriceListDetailTabId>('info');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getPriceListById(priceListId, {
        include: 'currency,seller',
      });
      setPl(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được bảng giá';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setPl(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [priceListId, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load, reloadSignal]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const syncList = useCallback(() => {
    void dispatch(fetchCategoryPriceLists({}));
  }, [dispatch]);

  const mergeDetailResponse = useCallback((next: PriceListApi) => {
    setPl(prev =>
      prev && prev.id === next.id
        ? {
            ...next,
            currency: next.currency ?? prev.currency,
            seller: next.seller ?? prev.seller,
          }
        : next,
    );
  }, []);

  const runSetDefault = useCallback(async () => {
    if (!pl || pl.is_default) {
      return;
    }
    setBusy(true);
    try {
      const next = await setPriceListAsDefault(pl.id);
      toast.success(`Đã đặt ${pl.name} làm bảng giá mặc định.`);
      mergeDetailResponse(next);
      syncList();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, [pl, syncList, mergeDetailResponse]);

  const runToggleActive = useCallback(async () => {
    if (!pl) {
      return;
    }
    const activating = !pl.is_active;
    const verb = activating ? 'kích hoạt' : 'vô hiệu hóa';
    const ok = await confirmDialog({
      title: activating ? 'Kích hoạt' : 'Vô hiệu hóa',
      message: `Bạn có chắc muốn ${verb} bảng giá ${pl.name}?`,
      confirmText: 'Xác nhận',
      destructive: !activating,
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    try {
      const next = activating
        ? await activatePriceList(pl.id)
        : await deactivatePriceList(pl.id);
      toast.success(activating ? `Đã kích hoạt bảng giá ${pl.name}.` : `Đã vô hiệu hóa bảng giá ${pl.name}.`);
      mergeDetailResponse(next);
      syncList();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, [pl, syncList, mergeDetailResponse]);

  const runDelete = useCallback(async () => {
    if (!pl) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Xóa bảng giá',
      message: `Xóa vĩnh viễn ${pl.name}? Hành động này không hoàn tác.`,
      confirmText: 'Xóa',
      destructive: true,
    });
    if (!ok) {
      return;
    }
    setBusy(true);
    try {
      await deletePriceList(pl.id);
      toast.success(`Đã xóa bảng giá ${pl.name}.`);
      syncList();
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, [pl, onBack, syncList]);

  const sellerLabel = pl?.seller?.name ?? '—';

  const tabBody = useMemo(() => {
    if (!pl) {
      return null;
    }
    if (tab === 'prices') {
      return (
        <PriceListDetailProductPricesPanel
          priceListId={pl.id}
          currencySymbol={pl.currency?.symbol ?? null}
          decimalPlaces={pl.currency?.decimal_places ?? 0}
          reloadSignal={reloadSignal}
          onOpenProduct={onOpenProduct}
        />
      );
    }
    const statusPill: 'active' | 'inactive' = pl.is_active
      ? 'active'
      : 'inactive';
    return (
      <DetailCard title="Thông tin cơ bản" icon="info">
        <DetailRow label="Tên bảng giá" value={pl.name} />
        <DetailRow label="Mã bảng giá" value={pl.code} />
        <View style={styles.grid2}>
          <View style={styles.gridCell}>
            <Text style={styles.detailLab}>Loại tiền</Text>
            <View style={styles.mt8}>
              <PriceListCurrencyLine
                code={pl.currency?.code ?? '—'}
                name={pl.currency?.name ?? '—'}
                styles={{
                  currRow: styles.currRow,
                  currDot: styles.currDot,
                  currDollar: styles.currDollar,
                  currLineTxt: styles.currLineTxt,
                }}
              />
            </View>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.detailLab}>Trạng thái</Text>
            <View style={styles.mt8}>
              <ProductStatusPill status={statusPill} />
            </View>
          </View>
        </View>
        <DetailRow label="Hiệu lực từ" value={fmtApiDateOnly(pl.valid_from)} />
        <DetailRow label="Hiệu lực đến" value={fmtApiDateOnly(pl.valid_to)} />
        <DetailRow label="Ngày tạo" value={fmtDateTimeVi(pl.created_at)} />
        <DetailRow label="Ngày cập nhật" value={fmtDateTimeVi(pl.updated_at)} />
        <DetailRow label="Quản lý Seller" value={sellerLabel} />
      </DetailCard>
    );
  }, [pl, tab, sellerLabel, reloadSignal, onOpenProduct]);

  const heroTrailing = useMemo(
    () => (
      <Pressable
        onPress={() =>
          onEditPriceList
            ? onEditPriceList(pl?.id ?? 0)
            : toast.info('Màn sửa sẽ bổ sung trên ứng dụng.')
        }
        hitSlop={8}
      >
        <SystemIcon name="pencil" size={20} color={palette.teal} />
      </Pressable>
    ),
    [onEditPriceList, pl?.id, palette.teal],
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
        <View style={styles.topNav}>
          <Pressable
            onPress={onRefresh}
            style={styles.refreshBtn}
            hitSlop={12}
            disabled={loading && !pl}
            accessibilityLabel="Tải lại"
          >
            <SystemIcon
              name="refresh"
              size={22}
              color={palette.textSecondary}
            />
          </Pressable>
        </View>

        {loading && !pl ? (
          <DetailScreenSkeleton />
        ) : error && !pl ? (
          <ScrollView
            style={detailScreenScrollFlex}
            contentContainerStyle={[
              styles.scrollPad,
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
        ) : pl ? (
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
                  title={pl.name}
                  subtitle={`Mã bảng giá: ${pl.code}`}
                  healthLabel="Trạng thái"
                  healthValue={pl.is_active ? 'Đang dùng' : 'Ngưng'}
                  trailing={heroTrailing}
                />

                <PriceListDetailTabBar activeTab={tab} onSelectTab={setTab} />

                <View style={detailScreenTabPanelsPad}>{tabBody}</View>

                <View style={dockInScroll.section}>
                  <PriceListDetailQuickDock
                    busy={busy}
                    isDefault={pl.is_default}
                    isActive={pl.is_active}
                    onSetDefault={async () => {
                      const ok = await confirmDialog({
                        title: 'Đặt làm mặc định',
                        message: `Đặt ${pl.name} làm bảng giá mặc định?`,
                        confirmText: 'Xác nhận',
                      });
                      if (ok) {
                        void runSetDefault();
                      }
                    }}
                    onToggleActive={() => void runToggleActive()}
                    onEdit={() =>
                      onEditPriceList
                        ? onEditPriceList(pl.id)
                        : toast.info('Màn sửa sẽ bổ sung trên ứng dụng.')
                    }
                    onDelete={() => void runDelete()}
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

function create_PriceListDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    topNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 6,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    refreshBtn: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
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
    scrollPad: { paddingHorizontal: 16, paddingTop: 8 },
    hero: {
      marginHorizontal: 16,
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
      marginBottom: 8,
    },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    heroIconWrap: {
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
    heroTitle: { fontSize: 16, fontWeight: '800', color: c.textPrimary },
    heroSub: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
    },
    heroEdit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(96,165,250,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(96,165,250,0.35)',
    },
    heroEditTxt: { fontSize: 13, fontWeight: '800', color: c.blue },
    grid2: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 10,
    },
    gridCell: { flex: 1, minWidth: 140 },
    detailLab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 4,
    },
    mt8: { marginTop: 2 },
    currRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    currDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(220,38,38,0.85)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    currDollar: { color: '#fff', fontWeight: '900', fontSize: 14 },
    currLineTxt: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
    },
    panelHint: {
      fontSize: 13,
      color: c.textSecondary,
      lineHeight: 19,
      marginBottom: 12,
    },
    emptyInner: {
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 12,
    },
    emptyIcon: { fontSize: 36, opacity: 0.35, marginBottom: 8 },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 6,
    },
    emptyHint: {
      fontSize: 13,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
  });
}
