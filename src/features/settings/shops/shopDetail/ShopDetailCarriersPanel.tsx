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
import { SettingsShipPartnerListMobileCard } from '../../shipPartners/components/SettingsShipPartnerListMobileCard';
import { getSellerShippingPartnerDirectory } from '@services/settings/shipPartnerAPI';
import type { SellerShippingPartnerApi } from '@services/settings/shipApiTypes';

const PER_PAGE = 1000;

export type ShopDetailCarriersPanelProps = {
  sellerId: number;
  /** ID bản ghi shipping-partner-sellers mặc định của shop. */
  shopDefaultShippingPartnerSellerId?: number | null;
  reloadSignal?: number;
};

function sortCarrierRows(
  items: SellerShippingPartnerApi[],
  shopDefaultId: number | null | undefined,
): SellerShippingPartnerApi[] {
  return [...items].sort((a, b) => {
    const aShop = shopDefaultId != null && a.id === shopDefaultId ? 1 : 0;
    const bShop = shopDefaultId != null && b.id === shopDefaultId ? 1 : 0;
    if (aShop !== bShop) {
      return bShop - aShop;
    }
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    const aName = a.shipping_partner?.name?.trim() ?? '';
    const bName = b.shipping_partner?.name?.trim() ?? '';
    return aName.localeCompare(bName, 'vi');
  });
}

export function ShopDetailCarriersPanel({
  sellerId,
  shopDefaultShippingPartnerSellerId = null,
  reloadSignal = 0,
}: ShopDetailCarriersPanelProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createPanelStyles);

  const [items, setItems] = useState<SellerShippingPartnerApi[]>([]);
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
        const data = await getSellerShippingPartnerDirectory({
          page: targetPage,
          per_page: PER_PAGE,
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
              : 'Không tải được đối tác vận chuyển',
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
    () => sortCarrierRows(items, shopDefaultShippingPartnerSellerId),
    [items, shopDefaultShippingPartnerSellerId],
  );

  const hasMore = page < lastPage;
  const shopDefaultRow =
    shopDefaultShippingPartnerSellerId != null
      ? rows.find(r => r.id === shopDefaultShippingPartnerSellerId)
      : null;

  return (
    <DetailCard title="Đối tác vận chuyển" icon="truck">
      {!loading && total > 0 ? (
        <Text style={styles.panelHint}>
          Tổng số kết nối:{' '}
          <Text style={styles.panelHintStrong}>
            {total.toLocaleString('vi-VN')}
          </Text>
        </Text>
      ) : null}

      {shopDefaultRow ? (
        <Text style={styles.shopDefaultHint}>
          Đối tác mặc định của shop:{' '}
          <Text style={styles.panelHintStrong}>
            {shopDefaultRow.shipping_partner?.name?.trim() || 'Đối tác'}
          </Text>
        </Text>
      ) : shopDefaultShippingPartnerSellerId != null ? (
        <Text style={styles.shopDefaultHintMuted}>
          Shop đang cấu hình đối tác mặc định #
          {shopDefaultShippingPartnerSellerId} (không có trong danh sách).
        </Text>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.tealLight} />
          <Text style={styles.loadingTxt}>Đang tải đối tác vận chuyển…</Text>
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
            <SystemIcon name="truck" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có đối tác</Text>
          <Text style={styles.emptyHint}>
            Kết nối đối tác vận chuyển của seller sẽ hiển thị tại đây.
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map(row => (
            <SettingsShipPartnerListMobileCard
              key={String(row.id)}
              row={row}
              actionsLocked
              isShopDefault={
                shopDefaultShippingPartnerSellerId != null &&
                row.id === shopDefaultShippingPartnerSellerId
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
