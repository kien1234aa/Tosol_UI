import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Image,
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
  inventoryProductDetailTabsForAppRole,
} from '@features/auth/utils/roleNavPolicy';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import {
  detailScreenBody,
  detailScreenMainCol,
  detailScreenMainColumn,
  detailScreenRoot,
  detailScreenScrollFlex,
} from '@shared/components/ui/detailScreenLayout';
import {
  detailScreenMainScrollContentTopPad,
  detailScreenScrollBottomInset,
  detailScreenTabPanelsPad,
} from '@shared/components/ui/detailScreenScrollDock';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  DetailCard,
  DetailRow,
} from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { getInventoryByProduct } from '@services/warehouse/inventoryAPI';
import type {
  InventoryByProductDataApi,
  InventoryByProductItemApi,
} from '@services/warehouse/inventoryByProductApiTypes';
import { InventoryBatchTable } from '../myInventory/components/InventoryBatchTable';
import { InventoryProductDetailTabBar } from '../myInventory/components/InventoryProductDetailTabBar';
import { formatProductUnit } from '@mappers/warehouse/inventoryMappers';
import type { InventoryProductDetailTabId } from '../myInventory/inventoryProductDetailTypes';

export type InventoryProductDetailScreenProps = {
  productId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  reloadSignal?: number;
};

function strOrDash(v: string | null | undefined): string {
  const t = (v ?? '').trim();
  return t.length > 0 ? t : '—';
}

export function InventoryProductDetailScreen({
  productId,
  onOpenDrawer,
  onBack,
  reloadSignal = 0,
}: InventoryProductDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_InventoryProductDetailScreen_styles);

  const insets = useSafeAreaInsets();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const inventoryProductTabs = useMemo(
    () => inventoryProductDetailTabsForAppRole(appRole),
    [appRole],
  );
  const [data, setData] = useState<InventoryByProductDataApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<InventoryProductDetailTabId>('info');

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await getInventoryByProduct(productId);
      setData(d);
    } catch (e: unknown) {
      setData(null);
      setError(
        e instanceof Error ? e.message : 'Không tải được chi tiết tồn kho',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load, reloadSignal]);

  useEffect(() => {
    setTab(prev => coerceDetailActiveTabId(prev, inventoryProductTabs, 'info'));
  }, [inventoryProductTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const firstItem: InventoryByProductItemApi | undefined = data?.items[0];
  const product = firstItem?.product;
  const summary = data?.summary;

  const tabContent = useMemo(() => {
    if (!data || !summary) {
      return null;
    }
    if (tab === 'batches') {
      return <InventoryBatchTable items={data.items} />;
    }
    return (
      <>
        <DetailCard title="Tổng quan" icon="chart">
          <View style={styles.overview3}>
            <View style={styles.ovCard}>
              <SystemIcon name="package" size={22} color={palette.textMuted} />
              <Text style={styles.ovVal}>
                {summary.total_quantity.toLocaleString('vi-VN')}
              </Text>
              <Text style={styles.ovLab}>Tồn kho</Text>
            </View>
            <View style={styles.ovCard}>
              <SystemIcon name="time" size={22} color={palette.orange} />
              <Text style={[styles.ovVal, styles.ovValOrange]}>
                {summary.reserved_quantity.toLocaleString('vi-VN')}
              </Text>
              <Text style={styles.ovLab}>Đã giữ</Text>
            </View>
            <View style={styles.ovCard}>
              <SystemIcon name="check" size={22} color={palette.green} />
              <Text style={[styles.ovVal, styles.ovValGreen]}>
                {summary.available_quantity.toLocaleString('vi-VN')}
              </Text>
              <Text style={styles.ovLab}>Có thể bán</Text>
            </View>
          </View>
        </DetailCard>

        {product ? (
          <DetailCard title="Thông tin sản phẩm" icon="cube">
            <DetailRow label="Tên sản phẩm" value={product.name} />
            <DetailRow label="Mã SKU" value={strOrDash(product.sku)} />
            {(() => {
              const productUnit = formatProductUnit(product.unit);
              return productUnit ? (
                <DetailRow label="Đơn vị" value={productUnit} />
              ) : null;
            })()}
            <DetailRow
              label="Số lô / vị trí"
              value={summary.locations_count.toLocaleString('vi-VN')}
            />
          </DetailCard>
        ) : null}
      </>
    );
  }, [
    data,
    summary,
    product,
    tab,
    palette.textMuted,
    palette.orange,
    palette.green,
    styles,
  ]);

  const thumbUri =
    product?.thumbnail_url?.trim() || product?.image_url?.trim() || undefined;

  const heroTitle = product?.name?.trim() || `Sản phẩm #${productId}`;
  const heroSku = product?.sku?.trim() || undefined;
  const heroUnit = formatProductUnit(product?.unit);

  const heroTrailing = useMemo(
    () =>
      thumbUri ? (
        <Image source={{ uri: thumbUri }} style={styles.heroThumb} />
      ) : (
        <View style={styles.heroThumbPh}>
          <SystemIcon name="package" size={28} color={palette.textMuted} />
        </View>
      ),
    [thumbUri, styles.heroThumb, styles.heroThumbPh, palette.textMuted],
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
          Tồn kho của tôi
          {product?.name ? ` · ${product.name}` : ` · #${productId}`}
        </Text>

        {loading && !data ? (
          <DetailScreenSkeleton />
        ) : error && !data ? (
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
        ) : data && summary ? (
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
                  title={heroTitle}
                  subtitle={heroSku}
                  healthLabel="Tồn kho"
                  healthValue={`${summary.total_quantity.toLocaleString('vi-VN')} tại ${summary.locations_count.toLocaleString('vi-VN')} lô`}
                  trailing={heroTrailing}
                  footer={
                    heroUnit ? (
                      <Text style={styles.heroMetaLine} numberOfLines={1}>
                        Đơn vị: {heroUnit}
                      </Text>
                    ) : undefined
                  }
                />

                <InventoryProductDetailTabBar
                  tabs={inventoryProductTabs}
                  activeTab={tab}
                  batchCount={data.items.length}
                  onSelectTab={setTab}
                />

                <View style={detailScreenTabPanelsPad}>{tabContent}</View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function create_InventoryProductDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
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
    heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    heroThumb: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.bgInput,
    },
    heroThumbPh: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroText: { flex: 1, minWidth: 0 },
    heroTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      lineHeight: 22,
    },
    heroSku: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
    },
    heroMeta: { marginTop: 8, gap: 4 },
    heroMetaLine: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
    overview3: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    ovCard: {
      flex: 1,
      minWidth: 100,
      padding: 12,
      borderRadius: 10,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      gap: 6,
    },
    ovVal: { fontSize: 16, fontWeight: '800', color: c.textPrimary },
    ovValOrange: { color: '#fb923c' },
    ovValGreen: { color: c.green },
    ovLab: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
  });
}
