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
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  productDetailTabsForAppRole,
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
import { ProductDeleteConfirmModal } from './components/ProductDeleteConfirmModal';
import { ProductStatusPill } from './components/ProductStatusPill';
import { PRODUCT_UNIT_OPTIONS } from './constants/productUnits';
import {
  ProductDetailOverviewSection,
  ProductDetailQuickDock,
} from './productDetail/ProductDetailScrollFooter';
import { ProductDetailTabBar } from './productDetail/ProductDetailTabBar';
import { ProductDetailPricesPanel } from './productDetail/ProductDetailPricesPanel';
import type { ProductDetailTabId } from './productDetail/productDetailTypes';
import {
  fetchCategoryProductsList,
  fetchCategoryProductStats,
} from '@services/category/categoryProductSlice';
import {
  deleteProduct,
  getProductById,
} from '@services/category/productAPI';
import type {
  ProductApi,
  ProductImageApi,
} from '@services/category/productApiTypes';

export type { ProductDetailTabId } from './productDetail/productDetailTypes';

export type ProductDetailScreenProps = {
  productId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Tăng sau khi lưu sửa sản phẩm để tải lại chi tiết. */
  reloadSignal?: number;
  onEditProduct?: (product: ProductApi) => void;
  onOpenPriceList?: (priceListId: number) => void;
};

function fmtNum(s: string | null | undefined): string {
  const n = Number.parseFloat(String(s ?? '0'));
  if (!Number.isFinite(n)) {
    return '0';
  }
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

function fmtPriceVnd(priceStr: string): string {
  const n = Number.parseFloat(priceStr) || 0;
  if (n <= 0) {
    return '0₫';
  }
  return `${Math.round(n).toLocaleString('vi-VN')}\u20AB`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('vi-VN');
}

function imageUrlFrom(item: ProductImageApi): string | null {
  return (
    item.original_url ??
    item.url ??
    item.image_url ??
    item.thumbnail_url ??
    null
  );
}

export function ProductDetailScreen({
  productId,
  onOpenDrawer,
  onBack,
  reloadSignal = 0,
  onEditProduct,
  onOpenPriceList,
}: ProductDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ProductDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const productDetailTabs = useMemo(
    () => productDetailTabsForAppRole(appRole),
    [appRole],
  );
  const sellerName = useAppSelector(s => s.auth.user?.seller?.name ?? '—');
  const [product, setProduct] = useState<ProductApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ProductDetailTabId>('info');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getProductById(productId);
      setProduct(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được sản phẩm';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setProduct(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load, reloadSignal]);

  useEffect(() => {
    setTab(prev => coerceDetailActiveTabId(prev, productDetailTabs, 'info'));
  }, [productDetailTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const runDeleteProduct = useCallback(async () => {
    if (!product) {
      return;
    }
    setDeleteSubmitting(true);
    try {
      await deleteProduct(product.id);
      toast.success(`Đã xóa sản phẩm ${product.name}.`);
      void dispatch(fetchCategoryProductsList({}));
      void dispatch(fetchCategoryProductStats());
      setDeleteModalVisible(false);
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setDeleteSubmitting(false);
    }
  }, [product, dispatch, onBack]);

  const showMinStockBanner = useMemo(() => {
    if (!product) {
      return false;
    }
    if (product.min_stock == null || String(product.min_stock).trim() === '') {
      return true;
    }
    const m = Number.parseFloat(String(product.min_stock));
    return !Number.isFinite(m) || m <= 0;
  }, [product]);

  const thumbUri = product?.thumbnail_url ?? product?.image_url ?? null;
  const storeLabel = product?.seller?.name ?? sellerName;

  const imageCount = useMemo(() => {
    if (!product) {
      return 0;
    }
    const list = product.images ?? [];
    if (list.length > 0) {
      return list.length;
    }
    return thumbUri ? 1 : 0;
  }, [product, thumbUri]);

  const tabContent = useMemo(() => {
    if (!product) {
      return null;
    }
    const images = (product.images ?? []).slice().sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
    const hasPrimary = images.some(img => img.is_primary === true);
    const unitLabel =
      PRODUCT_UNIT_OPTIONS.find(o => o.value === product.unit)?.label ??
      product.unit;
    const statusPill: 'active' | 'inactive' = product.is_active
      ? 'active'
      : 'inactive';

    if (tab === 'info') {
      const avail = Math.round(
        Number.parseFloat(String(product.available_stock ?? '0')) || 0,
      );
      const total = Math.round(
        Number.parseFloat(String(product.total_stock ?? '0')) || 0,
      );
      const w = fmtNum(product.weight);
      const dim = `${fmtNum(product.length)} × ${fmtNum(
        product.width,
      )} × ${fmtNum(product.height)} cm`;
      const volG = Number(product.volumetric_weight) * 1000;

      return (
        <>
          <DetailCard title="Thông tin sản phẩm" icon="clipboard">
            <DetailRow label="Tên" value={product.name} />
            <DetailRow label="Mã SKU" value={product.sku} />
            <View style={styles.grid2}>
              <View style={styles.gridCell}>
                <Text style={styles.detailLab}>Trạng thái</Text>
                <View style={styles.mt6}>
                  <ProductStatusPill status={statusPill} />
                </View>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.detailLab}>Giá cơ bản</Text>
                <Text style={[styles.detailValInline, styles.mt6]}>
                  {fmtPriceVnd(product.price)}
                </Text>
              </View>
            </View>
            <DetailRow label="Đơn vị" value={unitLabel} />
            <DetailRow label="Cửa hàng / Nhà bán" value={storeLabel} />
          </DetailCard>

          <DetailCard title="Kích thước & trọng lượng" icon="ruler">
            <DetailRow label="Kích thước (cm)" value={dim} />
            <DetailRow label="Trọng lượng" value={`${w} g`} />
            <DetailRow
              label="Trọng lượng quy đổi"
              value={`${volG.toLocaleString('vi-VN', {
                maximumFractionDigits: 2,
              })} g`}
            />
          </DetailCard>

          <DetailCard title="Tồn kho" icon="cube">
            <DetailRow
              label="Tồn khả dụng"
              value={avail.toLocaleString('vi-VN')}
            />
            <DetailRow label="Tổng tồn" value={total.toLocaleString('vi-VN')} />
            <DetailRow label="Ngày tạo" value={fmtDate(product.created_at)} />
            <DetailRow
              label="Ngày cập nhật"
              value={fmtDate(product.updated_at)}
            />
          </DetailCard>
        </>
      );
    }
    if (tab === 'images') {
      const thumb = product.thumbnail_url ?? product.image_url ?? null;
      if (images.length === 0 && !thumb) {
        return (
          <DetailCard title="Hình ảnh" icon="image">
            <Text style={styles.panelHint}>
              Chưa có hình ảnh. Ảnh đầu tiên sẽ là ảnh đại diện khi bạn thêm
              trên web.
            </Text>
          </DetailCard>
        );
      }
      const rows =
        images.length > 0 ? images : [{ url: thumb } as ProductImageApi];
      return (
        <DetailCard title="Hình ảnh" icon="image">
          <Text style={styles.panelHint}>
            Quản lý hình ảnh sản phẩm. Ảnh đầu tiên sẽ là ảnh đại diện.
          </Text>
          <View style={styles.imageGrid}>
            {rows.map((img, i) => {
              const uri = imageUrlFrom(img) ?? thumb;
              if (!uri) {
                return null;
              }
              const isMain =
                img.is_primary === true ||
                (!hasPrimary && images.length > 0 && i === 0);
              return (
                <View key={String(img.id ?? i)} style={styles.imageCard}>
                  <Image
                    source={{ uri }}
                    style={styles.imageFull}
                    resizeMode="cover"
                  />
                  <View style={styles.imageCardFooter}>
                    <Text style={styles.badgeMain}>
                      {isMain ? 'Chính' : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </DetailCard>
      );
    }
    if (tab === 'prices') {
      return (
        <ProductDetailPricesPanel
          productId={product.id}
          reloadSignal={reloadSignal}
          onOpenPriceList={onOpenPriceList}
        />
      );
    }
    if (tab === 'stock') {
      return (
        <DetailCard title="Tồn kho" icon="cube">
          <DetailRow
            label="Tổng tồn"
            value={
              product.total_stock != null ? String(product.total_stock) : '—'
            }
          />
          <DetailRow
            label="Tồn khả dụng"
            value={
              product.available_stock != null
                ? String(product.available_stock)
                : '—'
            }
          />
          <DetailRow
            label="Đã giữ"
            value={
              product.reserved_stock != null
                ? String(product.reserved_stock)
                : '—'
            }
          />
          <DetailRow
            label="Tồn tối thiểu"
            value={product.min_stock != null ? String(product.min_stock) : '—'}
          />
        </DetailCard>
      );
    }
    if (tab === 'barcode') {
      return (
        <DetailCard title="Mã vạch" icon="barcode">
          <Text style={styles.panelHintMuted}>
            Quản lý mã vạch để quét trong kho.
          </Text>
          {product.barcode ? (
            <View style={styles.barcodeMain}>
              <Text style={styles.barcodeLabel}>Mã vạch chính</Text>
              <Text style={styles.barcodeVal}>{product.barcode}</Text>
            </View>
          ) : null}
          <View style={styles.tealInfo}>
            <Text style={styles.tealInfoTxt}>
              Chưa có mã vạch phụ. Tạo hoặc thêm mã vạch cho hoạt động kho (sắp
              ra mắt).
            </Text>
          </View>
        </DetailCard>
      );
    }
    if (tab === 'shop') {
      return (
        <DetailCard title="Liên kết Shop" icon="link">
          <View style={styles.tealInfo}>
            <Text style={styles.tealInfoTxt}>
              Liên kết sản phẩm sắp ra mắt.
            </Text>
          </View>
          {Array.isArray(product.shop_mappings) &&
          product.shop_mappings.length > 0 ? (
            <Text
              style={styles.panelHint}
            >{`${product.shop_mappings.length} liên kết`}</Text>
          ) : null}
        </DetailCard>
      );
    }
    return null;
  }, [product, tab, storeLabel, styles, reloadSignal, onOpenPriceList]);

  const heroTrailing = useMemo(
    () =>
      thumbUri ? (
        <Image source={{ uri: thumbUri }} style={styles.heroThumb} />
      ) : (
        <View style={styles.heroThumbPh}>
          <SystemIcon name="cube" size={22} color={palette.textMuted} />
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
          Sản phẩm
          {product?.seller?.name ? ` · ${product.seller.name}` : ''}
          {product?.sku ? ` · ${product.sku}` : ''}
        </Text>

        {loading && !product ? (
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
        ) : product ? (
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
                  title={product.name}
                  subtitle={product.sku}
                  healthLabel="Cửa hàng"
                  healthValue={storeLabel}
                  statusSlot={
                    <ProductStatusPill
                      status={product.is_active ? 'active' : 'inactive'}
                    />
                  }
                  trailing={heroTrailing}
                />

                {showMinStockBanner ? (
                  <View style={styles.infoBanner}>
                    <SystemIcon name="info" size={18} color={palette.blue} />
                    <Text style={styles.infoBannerTxt}>
                      Chưa thiết lập mức tồn kho tối thiểu. Thiết lập để nhận
                      cảnh báo khi sắp hết hàng.
                    </Text>
                  </View>
                ) : null}

                <ProductDetailOverviewSection
                  product={product}
                  storeLabel={storeLabel}
                />

                <ProductDetailTabBar
                  tabs={productDetailTabs}
                  activeTab={tab}
                  imageCount={imageCount}
                  onSelectTab={setTab}
                />

                <View style={detailScreenTabPanelsPad}>{tabContent}</View>

                <View style={dockInScroll.section}>
                  <ProductDetailQuickDock
                    onEdit={() => onEditProduct?.(product)}
                    onDelete={() => setDeleteModalVisible(true)}
                  />
                </View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>

      <ProductDeleteConfirmModal
        visible={deleteModalVisible}
        loading={deleteSubmitting}
        onCancel={() => !deleteSubmitting && setDeleteModalVisible(false)}
        onConfirm={() => {
          void runDeleteProduct();
        }}
      />
    </View>
  );
}

function create_ProductDetailScreen_styles(c: AppColorPalette) {
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
    heroThumb: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.bgButton,
    },
    heroThumbPh: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
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
    heroStoreRow: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
    },
    heroStoreTxt: {
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
    panelHintMuted: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 17,
      marginBottom: 12,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    imageCard: {
      width: 140,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    imageFull: {
      width: '100%',
      height: 140,
    },
    imageCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 8,
      alignItems: 'center',
    },
    badgeMain: {
      fontSize: 11,
      fontWeight: '800',
      color: c.cyan,
    },
    emptyInner: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyIcon: {
      fontSize: 36,
      color: c.textMuted,
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
    barcodeMain: {
      marginBottom: 12,
      padding: 12,
      backgroundColor: c.bgInput,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    barcodeLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textMuted,
      marginBottom: 6,
    },
    barcodeVal: {
      fontSize: 16,
      fontWeight: '800',
      color: c.cyan,
      letterSpacing: 0.5,
    },
    tealInfo: {
      backgroundColor: 'rgba(45,212,191,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(45,212,191,0.3)',
      borderRadius: 10,
      padding: 12,
    },
    tealInfoTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.tealLight,
      lineHeight: 18,
    },
  });
}
