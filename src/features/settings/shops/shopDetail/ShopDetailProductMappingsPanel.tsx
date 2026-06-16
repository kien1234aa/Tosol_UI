import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { DetailCard } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { productShopMappingToListRow } from '@mappers/settings/productShopMappingMappers';
import { getProductShopMappingsPage } from '@services/settings/productShopMappingAPI';
import type { ProductShopMappingApi } from '@services/settings/productShopMappingApiTypes';
import { ShopProductMappingListMobileCard } from './ShopProductMappingListMobileCard';
import type { ShopProductMappingListRow } from './shopProductMappingTypes';

const PER_PAGE = 15;

export type ShopDetailProductMappingsPanelProps = {
  shopId: number;
  reloadSignal?: number;
  onOpenProduct?: (productId: number) => void;
};

export function ShopDetailProductMappingsPanel({
  shopId,
  reloadSignal = 0,
  onOpenProduct,
}: ShopDetailProductMappingsPanelProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createPanelStyles);

  const [items, setItems] = useState<ProductShopMappingApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await getProductShopMappingsPage({
          page: targetPage,
          per_page: PER_PAGE,
          filterShopId: shopId,
        });
        const nextItems = data.items ?? [];
        setItems(prev => (append ? [...prev, ...nextItems] : nextItems));
        setPage(data.meta?.current_page ?? targetPage);
        setLastPage(data.meta?.last_page ?? 1);
        setTotal(data.meta?.total ?? nextItems.length);
      } catch (e: unknown) {
        if (!append) {
          setItems([]);
          setTotal(0);
          setError(
            e instanceof Error
              ? e.message
              : 'Không tải được liên kết sản phẩm',
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [shopId],
  );

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage, reloadSignal]);

  const rows = useMemo(
    () => items.map(productShopMappingToListRow),
    [items],
  );

  const hasMore = page < lastPage;

  const openRow = useCallback(
    (row: ShopProductMappingListRow) => {
      if (onOpenProduct && row.productId > 0) {
        onOpenProduct(row.productId);
      }
    },
    [onOpenProduct],
  );

  return (
    <DetailCard title="Liên kết sản phẩm" icon="link">
      {!loading && total > 0 ? (
        <Text style={styles.panelHint}>
          Tổng số liên kết:{' '}
          <Text style={styles.panelHintStrong}>
            {total.toLocaleString('vi-VN')}
          </Text>
        </Text>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.tealLight} />
          <Text style={styles.loadingTxt}>Đang tải liên kết sản phẩm…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errBox}>
          <Text style={styles.errTxt}>{error}</Text>
          <Pressable onPress={() => void fetchPage(1, false)} hitSlop={8}>
            <Text style={styles.retryTxt}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && rows.length === 0 ? (
        <View style={styles.emptyInner}>
          <View style={styles.emptyIconSlot}>
            <SystemIcon name="link" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có liên kết</Text>
          <Text style={styles.emptyHint}>
            Sản phẩm được liên kết với cửa hàng này sẽ hiển thị tại đây.
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map(row => (
            <ShopProductMappingListMobileCard
              key={row.key}
              row={row}
              onPress={onOpenProduct ? () => openRow(row) : undefined}
            />
          ))}
        </View>
      ) : null}

      {hasMore && !error ? (
        <View style={styles.loadMoreWrap}>
          <Button
            title={loadingMore ? 'Đang tải…' : 'Tải thêm'}
            variant="secondary"
            disabled={loadingMore}
            onPress={() => void fetchPage(page + 1, true)}
          />
        </View>
      ) : null}
    </DetailCard>
  );
}

function createPanelStyles(c: AppColorPalette) {
  return StyleSheet.create({
    panelHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 19,
      marginBottom: 12,
    },
    panelHintStrong: { fontWeight: '800', color: c.textPrimary },
    centerBox: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 10,
    },
    loadingTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
    },
    errBox: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
      marginBottom: 12,
    },
    errTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.red,
      marginBottom: 8,
    },
    retryTxt: {
      fontSize: 13,
      fontWeight: '800',
      color: c.cyan,
    },
    emptyInner: {
      alignItems: 'center',
      paddingVertical: 16,
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
    list: { gap: 10 },
    loadMoreWrap: { marginTop: 12 },
  });
}
