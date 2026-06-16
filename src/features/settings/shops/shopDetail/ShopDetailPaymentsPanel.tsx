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
import { PaymentGatewayListMobileCard } from '../../paymentGateways/components/PaymentGatewayListMobileCard';
import { getPaymentGatewayDirectory } from '@services/settings/paymentGatewayAPI';
import type { SellerPaymentGatewayApi } from '@services/settings/paymentGatewayApiTypes';
import {
  onlinePaymentMethodDisplay,
  paymentMethodDisplay,
} from '../shopDirectoryLabels';

const PER_PAGE = 1000;

export type ShopDetailPaymentsPanelProps = {
  sellerId: number;
  /** ID bản ghi payment-gateways mặc định của shop. */
  shopPaymentGatewayId?: number | null;
  defaultPaymentMethod?: string | null;
  onlinePaymentMethod?: string | null;
  reloadSignal?: number;
};

function sortPaymentGatewayRows(
  items: SellerPaymentGatewayApi[],
  shopDefaultId: number | null | undefined,
): SellerPaymentGatewayApi[] {
  return [...items].sort((a, b) => {
    const aShop = shopDefaultId != null && a.id === shopDefaultId ? 1 : 0;
    const bShop = shopDefaultId != null && b.id === shopDefaultId ? 1 : 0;
    if (aShop !== bShop) {
      return bShop - aShop;
    }
    if (a.is_ready !== b.is_ready) {
      return a.is_ready ? -1 : 1;
    }
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    const aName = a.payment_gateway?.name?.trim() ?? '';
    const bName = b.payment_gateway?.name?.trim() ?? '';
    return aName.localeCompare(bName, 'vi');
  });
}

export function ShopDetailPaymentsPanel({
  sellerId,
  shopPaymentGatewayId = null,
  defaultPaymentMethod = null,
  onlinePaymentMethod = null,
  reloadSignal = 0,
}: ShopDetailPaymentsPanelProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createPanelStyles);

  const [items, setItems] = useState<SellerPaymentGatewayApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!Number.isFinite(sellerId) || sellerId <= 0) {
        setItems([]);
        setTotal(0);
        setError('Không xác định được seller của cửa hàng.');
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
        const data = await getPaymentGatewayDirectory({
          page: targetPage,
          per_page: PER_PAGE,
          isReady: true,
          sellerId,
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
              : 'Không tải được cổng thanh toán',
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sellerId],
  );

  useEffect(() => {
    void fetchPage(1, false);
  }, [fetchPage, reloadSignal]);

  const rows = useMemo(
    () => sortPaymentGatewayRows(items, shopPaymentGatewayId),
    [items, shopPaymentGatewayId],
  );

  const hasMore = page < lastPage;
  const shopDefaultRow =
    shopPaymentGatewayId != null
      ? rows.find(r => r.id === shopPaymentGatewayId)
      : null;

  const defaultMethodLabel = paymentMethodDisplay(defaultPaymentMethod ?? '');
  const onlineMethodLabel =
    onlinePaymentMethod != null && onlinePaymentMethod.trim() !== ''
      ? onlinePaymentMethodDisplay(onlinePaymentMethod)
      : null;

  return (
    <DetailCard title="Thanh toán" icon="wallet">
      <Text style={styles.panelHint}>
        PTTT mặc định:{' '}
        <Text style={styles.panelHintStrong}>{defaultMethodLabel}</Text>
      </Text>
      {onlineMethodLabel ? (
        <Text style={styles.panelHint}>
          Thanh toán online:{' '}
          <Text style={styles.panelHintStrong}>{onlineMethodLabel}</Text>
        </Text>
      ) : null}

      {!loading && total > 0 ? (
        <Text style={styles.panelHint}>
          Tổng số cổng sẵn sàng:{' '}
          <Text style={styles.panelHintStrong}>
            {total.toLocaleString('vi-VN')}
          </Text>
        </Text>
      ) : null}

      {shopDefaultRow ? (
        <Text style={styles.shopDefaultHint}>
          Cổng mặc định của shop:{' '}
          <Text style={styles.panelHintStrong}>
            {shopDefaultRow.payment_gateway?.name?.trim() || 'Cổng thanh toán'}
          </Text>
        </Text>
      ) : shopPaymentGatewayId != null ? (
        <Text style={styles.shopDefaultHintMuted}>
          Shop đang cấu hình cổng #{shopPaymentGatewayId} (không có trong danh
          sách).
        </Text>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.tealLight} />
          <Text style={styles.loadingTxt}>Đang tải cổng thanh toán…</Text>
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
            <SystemIcon name="wallet" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có cổng sẵn sàng</Text>
          <Text style={styles.emptyHint}>
            Cổng thanh toán đã cấu hình và sẵn sàng của seller sẽ hiển thị tại
            đây.
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map(row => (
            <PaymentGatewayListMobileCard
              key={String(row.id)}
              row={row}
              isShopDefault={
                shopPaymentGatewayId != null &&
                row.id === shopPaymentGatewayId
              }
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
      marginBottom: 8,
    },
    panelHintStrong: { fontWeight: '800', color: c.textPrimary },
    shopDefaultHint: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 17,
      marginBottom: 12,
    },
    shopDefaultHintMuted: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 17,
      marginBottom: 12,
    },
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
