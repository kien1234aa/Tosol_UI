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
import { OrderListMobileCard } from '../../../sales/orders/components/OrderListMobileCard';
import type { OrderListRow } from '../../../sales/orders/orderTypes';
import { saleOrderToListRow } from '@mappers/sales/orderMappers';
import {
  getSaleOrders,
  SALE_ORDERS_CUSTOMER_DETAIL_INCLUDE,
} from '@services/sales/orderAPI';
import type { SaleOrder } from '@services/sales/saleOrderApiTypes';

const PER_PAGE = 15;

function orderFooterMeta(row: OrderListRow): string {
  const parts: string[] = [];
  if (row.storeName !== '—') {
    parts.push(row.storeName);
  }
  if (row.packingWarehouseName !== '—') {
    parts.push(row.packingWarehouseName);
  }
  if (parts.length > 0) {
    return parts.join(' · ');
  }
  return row.createdAtDisplay;
}

export type CustomerDetailSaleOrdersPanelProps = {
  customerId: number;
  /** Tăng khi kéo làm mới màn chi tiết khách. */
  reloadSignal?: number;
  onOpenOrder?: (orderRef: string) => void;
};

export function CustomerDetailSaleOrdersPanel({
  customerId,
  reloadSignal = 0,
  onOpenOrder,
}: CustomerDetailSaleOrdersPanelProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createPanelStyles);

  const [items, setItems] = useState<SaleOrder[]>([]);
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
        const res = await getSaleOrders({
          page: targetPage,
          per_page: PER_PAGE,
          include: SALE_ORDERS_CUSTOMER_DETAIL_INCLUDE,
          customerId,
        });
        if (!res.success) {
          throw new Error(
            typeof res.message === 'string'
              ? res.message
              : 'Không tải được đơn hàng',
          );
        }
        const nextItems = res.data ?? [];
        setItems(prev => (append ? [...prev, ...nextItems] : nextItems));
        setPage(res.meta?.current_page ?? targetPage);
        setLastPage(res.meta?.last_page ?? 1);
        setTotal(res.meta?.total ?? nextItems.length);
      } catch (e: unknown) {
        if (!append) {
          setItems([]);
          setTotal(0);
          setError(e instanceof Error ? e.message : 'Không tải được đơn hàng');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage, reloadSignal]);

  const rows = useMemo(() => items.map(saleOrderToListRow), [items]);

  const hasMore = page < lastPage;

  const openRow = useCallback(
    (row: OrderListRow) => {
      const ref = row.id.trim();
      if (ref && onOpenOrder) {
        onOpenOrder(ref);
      }
    },
    [onOpenOrder],
  );

  return (
    <DetailCard title="Đơn hàng" icon="cart">
      {!loading && total > 0 ? (
        <Text style={styles.panelHint}>
          Tổng số đơn:{' '}
          <Text style={styles.panelHintStrong}>
            {total.toLocaleString('vi-VN')}
          </Text>
        </Text>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.tealLight} />
          <Text style={styles.loadingTxt}>Đang tải đơn hàng…</Text>
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
            <SystemIcon name="cart" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
          <Text style={styles.emptyHint}>
            Các đơn bán từ khách này sẽ hiển thị tại đây.
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map(row => (
            <OrderListMobileCard
              key={row.key}
              row={row}
              footerLeft={orderFooterMeta(row)}
              onPress={onOpenOrder ? () => openRow(row) : undefined}
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
    list: {
      gap: 10,
    },
    loadMoreWrap: {
      marginTop: 12,
    },
  });
}
