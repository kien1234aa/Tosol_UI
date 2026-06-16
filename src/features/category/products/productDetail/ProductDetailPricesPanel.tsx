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
import {
  productPriceToByPriceListRow,
  sortProductPricesByPriceList,
} from '@mappers/category/productPriceMappers';
import { getProductPricesPage } from '@services/category/productPriceAPI';
import type { ProductPriceApi } from '@services/category/productPriceApiTypes';
import { ProductPriceByPriceListMobileCard } from './ProductPriceByPriceListMobileCard';
import type { ProductPriceByPriceListRow } from './productPriceByPriceListTypes';

const PER_PAGE = 15;

export type ProductDetailPricesPanelProps = {
  productId: number;
  reloadSignal?: number;
  onOpenPriceList?: (priceListId: number) => void;
};

export function ProductDetailPricesPanel({
  productId,
  reloadSignal = 0,
  onOpenPriceList,
}: ProductDetailPricesPanelProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createPanelStyles);

  const [items, setItems] = useState<ProductPriceApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!Number.isFinite(productId) || productId <= 0) {
        setItems([]);
        setTotal(0);
        setError('Không xác định được sản phẩm.');
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      try {
        const data = await getProductPricesPage({
          page: targetPage,
          per_page: PER_PAGE,
          filterProductId: productId,
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
            e instanceof Error ? e.message : 'Không tải được giá sản phẩm',
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage, reloadSignal]);

  const rows = useMemo(
    (): ProductPriceByPriceListRow[] =>
      sortProductPricesByPriceList(items.map(productPriceToByPriceListRow)),
    [items],
  );

  const hasMore = page < lastPage;

  const openRow = useCallback(
    (row: ProductPriceByPriceListRow) => {
      if (onOpenPriceList && row.priceListId > 0) {
        onOpenPriceList(row.priceListId);
      }
    },
    [onOpenPriceList],
  );

  return (
    <DetailCard title="Bảng giá" icon="cash">
      {!loading && total > 0 ? (
        <Text style={styles.panelHint}>
          Số bảng giá có giá:{' '}
          <Text style={styles.panelHintStrong}>
            {total.toLocaleString('vi-VN')}
          </Text>
        </Text>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.tealLight} />
          <Text style={styles.loadingTxt}>Đang tải giá theo bảng giá…</Text>
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
            <SystemIcon name="cash" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có giá sản phẩm</Text>
          <Text style={styles.emptyHint}>
            Giá của sản phẩm trong các bảng giá sẽ hiển thị tại đây.
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map(row => (
            <ProductPriceByPriceListMobileCard
              key={row.key}
              row={row}
              onPress={onOpenPriceList ? () => openRow(row) : undefined}
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
