import React, { memo, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  formatDateTimeVi,
  formatOrderDateVi,
} from '../../../sales/screens/orderDetail/orderDetailFormatters';
import type {
  InvoiceApi,
  InvoiceLineItemApi,
  InvoiceTotalApi,
} from '@services/finance/invoiceApiTypes';
import {
  apiInvoiceStatusToRowStatus,
  invoiceRowStatusLabel,
} from '@mappers/finance/invoiceListMappers';
import type { InvoiceDetailTabId } from './invoiceDetailTypes';

function fmtMoneyNum(n: number, symbol: string): string {
  if (!Number.isFinite(n)) {
    return '—';
  }
  return `${Math.round(n).toLocaleString('vi-VN')}${symbol}`;
}

function primaryTotal(inv: InvoiceApi): InvoiceTotalApi | null {
  const t = inv.totals?.[0];
  return t ?? null;
}

function lineDesc(it: InvoiceLineItemApi): string {
  return (it.description ?? it.name ?? '—').trim() || '—';
}

function lineQty(it: InvoiceLineItemApi): string {
  const q = it.quantity;
  if (q == null) {
    return '—';
  }
  const n = typeof q === 'number' ? q : Number(String(q).replace(',', '.'));
  if (!Number.isFinite(n)) {
    return String(q);
  }
  return n.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function lineMoney(
  it: InvoiceLineItemApi,
  fallbackSym: string,
): { unit: string; total: string } {
  const sym = it.currency?.symbol ?? fallbackSym;
  const up = it.unit_price;
  const tot = it.total_amount ?? it.line_total;
  const un =
    typeof up === 'number'
      ? up
      : up != null
      ? Number(String(up).replace(',', '.'))
      : NaN;
  const tn =
    typeof tot === 'number'
      ? tot
      : tot != null
      ? Number(String(tot).replace(',', '.'))
      : NaN;
  return {
    unit: fmtMoneyNum(un, sym),
    total: fmtMoneyNum(tn, sym),
  };
}

export type InvoiceDetailTabPanelsProps = {
  activeTab: InvoiceDetailTabId;
  inv: InvoiceApi;
  lineItems: InvoiceLineItemApi[];
  onOpenSettlement?: (settlementRef: string) => void;
};

function InvoiceDetailTabPanelsInner({
  activeTab,
  inv,
  lineItems,
  onOpenSettlement,
}: InvoiceDetailTabPanelsProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createInvoiceDetailTabPanelsStyles);
  const rowStatus = apiInvoiceStatusToRowStatus(inv.status);
  const statusLabel = invoiceRowStatusLabel(rowStatus);
  const total0 = primaryTotal(inv);
  const sym = total0?.currency?.symbol ?? '\u20AB';
  const warehouseName = inv.warehouse?.name?.trim() || '—';
  const sellerCode =
    inv.seller?.code?.trim() || inv.seller?.legacy_id?.trim() || '—';
  const settlementRef =
    inv.settlement?.settlement_number?.trim() ||
    inv.settlement?.reference?.trim() ||
    null;

  return useMemo(() => {
    switch (activeTab) {
      case 'items':
        return (
          <DetailCard title="Các mục" icon="clipboard">
            {lineItems.length === 0 ? (
              <Text style={styles.hintMuted}>
                Chưa có dòng mục hoặc API chưa include `items`.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View style={{ minWidth: 520 }}>
                  <View style={styles.tableHead}>
                    <Text style={[styles.th, styles.thType]}>LOẠI</Text>
                    <Text style={[styles.th, styles.thDesc]}>MÔ TẢ</Text>
                    <Text style={[styles.th, styles.thNum]}>SL</Text>
                    <Text style={[styles.th, styles.thMoney]}>ĐƠN GIÁ</Text>
                    <Text style={[styles.th, styles.thMoney]}>TỔNG</Text>
                  </View>
                  {lineItems.map(it => {
                    const { unit, total } = lineMoney(it, sym);
                    const typeLab = (it.type ?? 'item').trim() || '—';
                    return (
                      <View key={it.id} style={styles.tr}>
                        <View style={styles.thType}>
                          <View style={styles.typePill}>
                            <Text style={styles.typePillTxt} numberOfLines={1}>
                              {typeLab}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[styles.td, styles.thDesc]}
                          numberOfLines={3}
                        >
                          {lineDesc(it)}
                        </Text>
                        <Text style={[styles.tdNum, styles.thNum]}>
                          {lineQty(it)}
                        </Text>
                        <Text style={[styles.tdMoney, styles.thMoney]}>
                          {unit}
                        </Text>
                        <Text style={[styles.tdMoney, styles.thMoney]}>
                          {total}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </DetailCard>
        );
      case 'payment':
        return (
          <DetailCard title="Thanh toán" icon="card">
            <View style={styles.payBanner}>
              <SystemIcon name="info" size={18} color={palette.tealLight} />
              <View style={styles.payBannerTextCol}>
                <Text style={styles.payBannerTitle}>
                  Thanh toán được theo dõi qua Đối soát
                </Text>
                {settlementRef ? (
                  <Pressable
                    onPress={() => onOpenSettlement?.(settlementRef)}
                  >
                    <Text style={styles.payBannerLink}>
                      Xem Đối Soát ({settlementRef})
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={styles.hintMuted}>
                    Liên kết đối soát sẽ hiển thị khi hóa đơn gắn settlement và
                    API trả `settlement`.
                  </Text>
                )}
              </View>
            </View>
          </DetailCard>
        );
      default:
        return (
          <>
            <DetailCard title="Thông tin chung" icon="document">
              <DetailRow label="Trạng thái" value={statusLabel} />
              <DetailRow label="Kho hàng" value={warehouseName} />
              <DetailRow label="Mã hóa đơn" value={inv.invoice_number?.trim() || '—'} />
              {inv.notes?.trim() ? (
                <DetailRow label="Ghi chú" value={inv.notes.trim()} />
              ) : null}
            </DetailCard>

            <DetailCard title="Seller" icon="store">
              <DetailRow
                label="Tên Seller"
                value={inv.seller?.name?.trim() || '—'}
              />
              <DetailRow label="Mã Seller" value={sellerCode} />
            </DetailCard>

            <DetailCard title="Kỳ thanh toán" icon="calendar">
              <DetailRow
                label="Từ ngày"
                value={formatOrderDateVi(inv.billing_period_from)}
              />
              <DetailRow
                label="Đến ngày"
                value={formatOrderDateVi(inv.billing_period_to)}
              />
              <DetailRow
                label="Ngày phát hành"
                value={formatDateTimeVi(inv.issued_at)}
              />
              <DetailRow
                label="Hạn thanh toán"
                value={formatOrderDateVi(inv.due_at)}
              />
              <DetailRow
                label="Ngày tạo"
                value={formatDateTimeVi(inv.created_at)}
              />
            </DetailCard>
          </>
        );
    }
  }, [
    activeTab,
    inv,
    lineItems,
    statusLabel,
    sellerCode,
    settlementRef,
    onOpenSettlement,
    sym,
    warehouseName,
    palette,
    styles,
  ]);
}

export const InvoiceDetailTabPanels = memo(InvoiceDetailTabPanelsInner);

function createInvoiceDetailTabPanelsStyles(c: AppColorPalette) {
  return StyleSheet.create({
    hintMuted: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: '600',
      lineHeight: 17,
    },
    tableHead: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: 8,
      marginBottom: 4,
      alignItems: 'center',
    },
    th: {
      fontSize: 10,
      fontWeight: '800',
      color: c.textMuted,
    },
    thType: { width: 88 },
    thDesc: { flex: 1, minWidth: 120 },
    thNum: { width: 56, textAlign: 'right' },
    thMoney: { width: 100, textAlign: 'right' },
    tr: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    td: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    tdNum: { fontSize: 12, fontWeight: '700', color: c.textPrimary },
    tdMoney: { fontSize: 12, fontWeight: '800', color: c.textPrimary },
    typePill: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: 'rgba(45,212,191,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(45,212,191,0.35)',
    },
    typePillTxt: {
      fontSize: 10,
      fontWeight: '800',
      color: c.tealLight,
      textTransform: 'uppercase',
    },
    payBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 10,
      backgroundColor: 'rgba(45,212,191,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(45,212,191,0.35)',
    },
    payBannerTextCol: { flex: 1, minWidth: 0, gap: 8 },
    payBannerTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
    },
    payBannerLink: {
      fontSize: 13,
      fontWeight: '800',
      color: c.cyan,
      textDecorationLine: 'underline',
    },
  });
}
