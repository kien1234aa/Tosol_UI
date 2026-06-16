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
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
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
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  shopDetailTabsForAppRole,
} from '@features/auth/utils/roleNavPolicy';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  activateShop,
  deactivateShop,
  deleteShop,
  getShopById,
} from '@services/settings/shopAPI';
import {
  fetchSalesMenuShops,
  fetchShopDirectory,
} from '@services/settings/shopSlice';
import type { ShopDetailApi } from '@services/settings/shopResponseTypes';
import { ProductStatusPill } from '../../category/products/components/ProductStatusPill';
import {
  currencyLabelFromId,
  platformDisplayLabel,
} from './shopDirectoryLabels';
import { ShopDetailQuickDock } from './shopDetail/ShopDetailScrollFooter';
import { ShopDetailTabBar } from './shopDetail/ShopDetailTabBar';
import { ShopDetailTabPanels } from './shopDetail/ShopDetailTabPanels';
import type { ShopDetailTabId } from './shopDetail/shopDetailTypes';

export type ShopDetailScreenProps = {
  shopId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  reloadSignal?: number;
  onEditShop?: (shopId: number) => void;
  onOpenProduct?: (productId: number) => void;
};

export function ShopDetailScreen({
  shopId,
  onOpenDrawer,
  onBack,
  reloadSignal = 0,
  onEditShop,
  onOpenProduct,
}: ShopDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const shopDetailTabs = useMemo(
    () => shopDetailTabsForAppRole(appRole),
    [appRole],
  );
  const [shop, setShop] = useState<ShopDetailApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ShopDetailTabId>('info');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getShopById(shopId);
      setShop(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được cửa hàng';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setShop(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load, reloadSignal]);

  useEffect(() => {
    setTab(prev => coerceDetailActiveTabId(prev, shopDetailTabs, 'info'));
  }, [shopDetailTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const syncShopLists = useCallback(() => {
    void dispatch(fetchShopDirectory({ page: 1, per_page: 10, status: 'all' }));
    void dispatch(fetchSalesMenuShops());
  }, [dispatch]);

  const openEdit = useCallback(() => {
    if (!shop) {
      return;
    }
    if (onEditShop) {
      onEditShop(shop.id);
      return;
    }
    toast.info('Màn sửa sẽ bổ sung trên ứng dụng.');
  }, [shop, onEditShop]);

  const runDeactivate = useCallback(async () => {
    if (!shop) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Vô hiệu hóa',
      message: `Vô hiệu hóa cửa hàng ${shop.name}?`,
      confirmText: 'Xác nhận',
      destructive: true,
    });
    if (ok) {
      setBusy(true);
      try {
        const next = await deactivateShop(shop.id);
        toast.success(`Đã vô hiệu hóa cửa hàng ${shop.name}.`);
        setShop(prev =>
          prev && prev.id === next.id ? { ...prev, ...next } : next,
        );
        syncShopLists();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      } finally {
        setBusy(false);
      }
    }
  }, [shop, syncShopLists]);

  const runActivate = useCallback(async () => {
    if (!shop) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Kích hoạt',
      message: `Kích hoạt lại cửa hàng ${shop.name}?`,
      confirmText: 'Xác nhận',
    });
    if (ok) {
      setBusy(true);
      try {
        const next = await activateShop(shop.id);
        toast.success(`Đã kích hoạt cửa hàng ${shop.name}.`);
        setShop(prev =>
          prev && prev.id === next.id ? { ...prev, ...next } : next,
        );
        syncShopLists();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      } finally {
        setBusy(false);
      }
    }
  }, [shop, syncShopLists]);

  const runDelete = useCallback(async () => {
    if (!shop) {
      return;
    }
    const ok = await confirmDialog({
      title: 'Xóa cửa hàng',
      message: `Xóa ${shop.name}? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      destructive: true,
    });
    if (ok) {
      setBusy(true);
      try {
        await deleteShop(shop.id);
        toast.success(`Đã xóa cửa hàng ${shop.name}.`);
        syncShopLists();
        onBack();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      } finally {
        setBusy(false);
      }
    }
  }, [shop, syncShopLists, onBack]);

  const statusPill = useMemo(() => {
    if (
      shop == null ||
      shop.is_active === null ||
      shop.is_active === undefined
    ) {
      return null;
    }
    return shop.is_active ? 'active' : 'inactive';
  }, [shop]);

  const heroTrailing = useMemo(
    () => (
      <Pressable onPress={openEdit} hitSlop={8}>
        <SystemIcon name="pencil" size={20} color={palette.teal} />
      </Pressable>
    ),
    [openEdit, palette.teal],
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
        <View style={styles.topBar}>
          <Pressable
            onPress={onRefresh}
            style={styles.refreshBtn}
            hitSlop={10}
            accessibilityLabel="Tải lại"
          >
            <SystemIcon name="refresh" size={22} color={palette.cyan} />
          </Pressable>
        </View>

        {loading && !shop ? (
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
        ) : shop ? (
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
                  title={shop.name}
                  subtitle={platformDisplayLabel(shop.platform)}
                  healthLabel="Tiền tệ"
                  healthValue={currencyLabelFromId(shop.currency_id)}
                  statusSlot={
                    <View style={styles.heroBadgeRow}>
                      {statusPill ? (
                        <ProductStatusPill status={statusPill} />
                      ) : null}
                      <View
                        style={[
                          styles.miniPill,
                          { backgroundColor: palette.orangeBg },
                        ]}
                      >
                        <Text
                          style={[styles.miniPillTxt, { color: palette.orange }]}
                        >
                          {platformDisplayLabel(shop.platform)}
                        </Text>
                      </View>
                    </View>
                  }
                  trailing={heroTrailing}
                />

                <ShopDetailTabBar
                  tabs={shopDetailTabs}
                  activeTab={tab}
                  onSelectTab={setTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <ShopDetailTabPanels
                    activeTab={tab}
                    shop={shop}
                    reloadSignal={reloadSignal}
                    onOpenProduct={onOpenProduct}
                  />
                </View>

                <View style={dockInScroll.section}>
                  <ShopDetailQuickDock
                    shop={shop}
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

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 16,
      paddingLeft: 0,
    },
    refreshBtn: {
      marginTop: 4,
      padding: 6,
    },
    errBox: {
      margin: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 14, fontWeight: '600', color: c.red, marginBottom: 12 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.cyan },
    heroBadgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    miniPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    miniPillTxt: {
      fontSize: 11,
      fontWeight: '800',
    },
  });
}
