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
import { BankAccountListMobileCard } from '../../bankAccount/components/BankAccountListMobileCard';
import { getBankAccountDirectory } from '@services/settings/bankAccountAPI';
import type { BankAccountListItem } from '@services/settings/bankAccountResponseTypes';

const PER_PAGE = 1000;

export type ShopDetailBankAccountsPanelProps = {
  sellerId: number;
  /** TK ngân hàng mặc định của shop (nếu có). */
  shopDefaultBankAccountId?: number | null;
  reloadSignal?: number;
};

function sortBankAccounts(
  accounts: BankAccountListItem[],
  shopDefaultBankAccountId: number | null | undefined,
): BankAccountListItem[] {
  return [...accounts].sort((a, b) => {
    const aShop =
      shopDefaultBankAccountId != null && a.id === shopDefaultBankAccountId
        ? 1
        : 0;
    const bShop =
      shopDefaultBankAccountId != null && b.id === shopDefaultBankAccountId
        ? 1
        : 0;
    if (aShop !== bShop) {
      return bShop - aShop;
    }
    if (a.is_default !== b.is_default) {
      return a.is_default ? -1 : 1;
    }
    return b.id - a.id;
  });
}

export function ShopDetailBankAccountsPanel({
  sellerId,
  shopDefaultBankAccountId = null,
  reloadSignal = 0,
}: ShopDetailBankAccountsPanelProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createPanelStyles);

  const [items, setItems] = useState<BankAccountListItem[]>([]);
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
        const data = await getBankAccountDirectory({
          page: targetPage,
          per_page: PER_PAGE,
          sellerId,
        });
        const nextItems = data.accounts ?? [];
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
              : 'Không tải được tài khoản ngân hàng',
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
    () => sortBankAccounts(items, shopDefaultBankAccountId),
    [items, shopDefaultBankAccountId],
  );

  const hasMore = page < lastPage;
  const shopDefaultAccount =
    shopDefaultBankAccountId != null
      ? rows.find(a => a.id === shopDefaultBankAccountId)
      : null;

  return (
    <DetailCard title="Tài khoản ngân hàng" icon="card">
      {!loading && total > 0 ? (
        <Text style={styles.panelHint}>
          Tổng số tài khoản:{' '}
          <Text style={styles.panelHintStrong}>
            {total.toLocaleString('vi-VN')}
          </Text>
        </Text>
      ) : null}

      {shopDefaultAccount ? (
        <Text style={styles.shopDefaultHint}>
          TK mặc định của shop:{' '}
          <Text style={styles.panelHintStrong}>
            {shopDefaultAccount.bank_name} · {shopDefaultAccount.account_number}
          </Text>
        </Text>
      ) : shopDefaultBankAccountId != null ? (
        <Text style={styles.shopDefaultHintMuted}>
          Shop đang cấu hình TK mặc định #{shopDefaultBankAccountId} (không có
          trong danh sách seller).
        </Text>
      ) : null}

      {loading && items.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={palette.tealLight} />
          <Text style={styles.loadingTxt}>Đang tải tài khoản ngân hàng…</Text>
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
            <SystemIcon name="card" size={34} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có tài khoản</Text>
          <Text style={styles.emptyHint}>
            Tài khoản ngân hàng của seller sẽ hiển thị tại đây.
          </Text>
        </View>
      ) : null}

      {rows.length > 0 ? (
        <View style={styles.list}>
          {rows.map(row => (
            <BankAccountListMobileCard
              key={String(row.id)}
              row={row}
              actionsLocked
              isShopDefault={
                shopDefaultBankAccountId != null &&
                row.id === shopDefaultBankAccountId
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
