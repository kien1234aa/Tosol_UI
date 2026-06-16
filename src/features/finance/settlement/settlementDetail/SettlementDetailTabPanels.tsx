import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet, Text, View } from 'react-native';
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
  SettlementApi,
  SettlementItemApi,
  SettlementPaymentApi,
  SettlementUserLiteApi,
} from '@services/finance/settlementApiTypes';
import {
  apiSettlementStatusToRowStatus,
  mapSettlementPaymentDirection,
  settlementCurrencySymbol,
  settlementRowStatusLabel,
  settlementToNum,
} from '@mappers/finance/settlementListMappers';
import type { SettlementDetailTabId } from './settlementDetailTypes';

export type SettlementDetailTabPanelsProps = {
  activeTab: SettlementDetailTabId;
  data: SettlementApi;
};

function fmtMoneyNum(
  v: number | string | null | undefined,
  symbol: string,
): string | null {
  const n = settlementToNum(v);
  if (!Number.isFinite(n)) {
    return null;
  }
  return `${Math.round(n).toLocaleString('vi-VN')}${symbol}`;
}

function feeRow(label: string, n: number | string | null | undefined, sym: string) {
  const formatted = fmtMoneyNum(n, sym);
  if (!formatted) {
    return null;
  }
  return <DetailRow label={label} value={formatted} />;
}

function userLiteDisplay(u: SettlementUserLiteApi | null | undefined): string {
  if (u == null) {
    return '—';
  }
  const n = u.name?.trim();
  if (n) {
    return n;
  }
  const e = u.email?.trim();
  if (e) {
    return e;
  }
  return `#${u.id}`;
}

function pickCreatedByUser(
  data: SettlementApi,
): SettlementUserLiteApi | null | undefined {
  return data.created_by_user ?? data.createdByUser ?? null;
}

function pickConfirmedByUser(
  data: SettlementApi,
): SettlementUserLiteApi | null | undefined {
  return data.confirmed_by_user ?? data.confirmedByUser ?? null;
}

function pickPaymentProcessor(
  p: SettlementPaymentApi,
): SettlementUserLiteApi | null | undefined {
  return p.processed_by_user ?? p.processedByUser ?? null;
}

type SettlementDetailStyles = ReturnType<typeof create_SettlementDetailTabPanels_styles>;

function CurrencyLineTable({
  item,
  styles,
}: {
  item: SettlementItemApi;
  styles: SettlementDetailStyles;
}) {
  const sym = settlementCurrencySymbol(item);
  const code = item.currency?.code?.trim() || null;
  const { label: dirLabel } = mapSettlementPaymentDirection(
    item.payment_direction,
  );
  const cod = fmtMoneyNum(item.cod_collected, sym);
  const totalPayable = fmtMoneyNum(
    Math.abs(settlementToNum(item.total_payable)),
    sym,
  );
  const net = fmtMoneyNum(item.net_amount, sym);
  return (
    <View style={styles.lineBlock}>
      {code ? <Text style={styles.lineTitle}>{code}</Text> : null}
      {cod ? <DetailRow label="COD đã thu" value={cod} /> : null}
      {feeRow('Phí lưu kho', item.storage_fee, sym)}
      {feeRow('Phí đóng gói', item.packing_fee, sym)}
      {feeRow('Phí xuất kho', item.outbound_fee, sym)}
      {feeRow('Phí nhập kho', item.inbound_fee, sym)}
      {feeRow('Phí luân chuyển', item.transfer_fee, sym)}
      {feeRow('Phí vận chuyển', item.shipping_fee, sym)}
      {totalPayable ? (
        <DetailRow label="Tổng phải trả (phí)" value={totalPayable} />
      ) : null}
      {net ? <DetailRow label="Số tiền ròng" value={net} /> : null}
      <DetailRow label="Chiều thanh toán" value={dirLabel} />
    </View>
  );
}

export function SettlementDetailTabPanels({
  activeTab,
  data,
}: SettlementDetailTabPanelsProps) {
  const styles = useThemeStyleSheet(create_SettlementDetailTabPanels_styles);
  const palette = useAppColors();

  const items = data.items ?? [];
  const payments = data.payments ?? [];
  const seller = data.seller;
  const sellerCode = seller?.code?.trim() || seller?.legacy_id?.trim() || null;
  const sellerName = seller?.name?.trim() || null;
  const warehouseName =
    data.warehouse?.name?.trim() ||
    (data.warehouse_id != null ? `Kho #${data.warehouse_id}` : null);
  const warehouseAddr = data.warehouse?.address?.trim() || '';
  const rowStatus = apiSettlementStatusToRowStatus(data.status);
  const statusLabel = settlementRowStatusLabel(rowStatus);
  const dateOrDash = (iso: string | null) =>
    iso != null && iso.trim() !== '' ? formatOrderDateVi(iso) : '—';

  switch (activeTab) {
    case 'info':
      return (
        <>
          <DetailCard title="Seller" icon="store">
            {sellerName ? (
              <DetailRow label="Tên Seller" value={sellerName} />
            ) : null}
            {sellerCode ? (
              <DetailRow label="Mã Seller" value={sellerCode} />
            ) : null}
          </DetailCard>
          <DetailCard title="Kỳ thanh toán" icon="calendar">
            <DetailRow
              label="Từ ngày"
              value={formatOrderDateVi(data.period_from)}
            />
            <DetailRow
              label="Đến ngày"
              value={formatOrderDateVi(data.period_to)}
            />
            {data.confirmed_at?.trim() ? (
              <DetailRow
                label="Đã xác nhận"
                value={dateOrDash(data.confirmed_at)}
              />
            ) : null}
            {data.settled_at?.trim() ? (
              <DetailRow
                label="Đã quyết toán"
                value={dateOrDash(data.settled_at)}
              />
            ) : null}
          </DetailCard>
          <DetailCard title="Chi tiết đối soát" icon="clipboard">
            <DetailRow label="Trạng thái" value={statusLabel} />
            {warehouseName ? (
              <DetailRow label="Kho hàng" value={warehouseName} />
            ) : null}
            {warehouseAddr ? (
              <DetailRow label="Địa chỉ kho" value={warehouseAddr} />
            ) : null}
            {data.notes?.trim() ? (
              <DetailRow label="Ghi chú" value={data.notes.trim()} />
            ) : null}
            <DetailRow
              label="Ngày tạo"
              value={formatDateTimeVi(data.created_at)}
            />
            <DetailRow
              label="Người tạo"
              value={(() => {
                const u = pickCreatedByUser(data);
                const fromUser = userLiteDisplay(u);
                if (fromUser !== '—') {
                  return fromUser;
                }
                if (
                  data.created_by != null &&
                  Number.isFinite(data.created_by)
                ) {
                  return `#${data.created_by}`;
                }
                return '—';
              })()}
            />
            <DetailRow
              label="Người xác nhận"
              value={ userLiteDisplay(pickConfirmedByUser(data))}
            />
          </DetailCard>
        </>
      );
    case 'currency':
      return (
        <DetailCard title="Chi tiết phí" icon="cash">
          {items.length === 0 ? (
            <Text style={styles.hintMuted}>
              Chưa có dòng tiền tệ hoặc API chưa include `items`.
            </Text>
          ) : (
            items.map(it => <CurrencyLineTable key={it.id} item={it} styles={styles} />)
          )}
        </DetailCard>
      );
    case 'payment':
      return (
        <DetailCard title="Thanh toán" icon="card">
          {payments.length === 0 ? (
            <Text style={styles.bodyMuted}>
              Chưa có ghi nhận thanh toán cho đối soát này.
            </Text>
          ) : (
            payments.map(p => {
              const sym = p.currency?.symbol?.trim() || 'đ';
              const amtStr = fmtMoneyNum(p.amount, sym);
              const proc = userLiteDisplay(pickPaymentProcessor(p));
              const currencyCode = p.currency?.code?.trim() || null;
              const statusText = (p.status ?? '').trim() || null;
              return (
                <View key={p.id} style={styles.payBlock}>
                  {amtStr ? <DetailRow label="Số tiền" value={amtStr} /> : null}
                  {currencyCode ? (
                    <DetailRow label="Tiền tệ" value={currencyCode} />
                  ) : null}
                  {statusText ? (
                    <DetailRow label="Trạng thái" value={statusText} />
                  ) : null}
                  <DetailRow
                    label="Ngày tạo"
                    value={formatDateTimeVi(p.created_at)}
                  />
                  {proc !== '—' ? (
                    <DetailRow label="Xử lý bởi" value={proc} />
                  ) : null}
                </View>
              );
            })
          )}
          <View style={styles.tealInfo}>
            <SystemIcon name="info" size={16} color={palette.tealLight} />
            <Text style={styles.tealInfoTxt}>
              Thanh toán liên quan đối soát được theo dõi theo trạng thái xác
              nhận và quyết toán.
            </Text>
          </View>
        </DetailCard>
      );
    default:
      return null;
  }
}

function create_SettlementDetailTabPanels_styles(c: AppColorPalette) {
  return StyleSheet.create({
    hintMuted: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 18,
    },
    bodyMuted: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 19,
      marginBottom: 12,
    },
    lineBlock: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    lineTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.cyan,
      marginBottom: 8,
    },
    tealInfo: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
      padding: 10,
      borderRadius: 8,
      backgroundColor: 'rgba(45,212,191,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(45,212,191,0.3)',
    },
    tealInfoTxt: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: c.tealLight,
      lineHeight: 17,
    },
    payBlock: {
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
  });
}
