import React, { useMemo } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type {
  InboundNestedPurchaseOrderItemApi,
  InboundOrderApi,
  InboundOrderItemApi,
  InboundOrderReceiveApi,
} from '@services/warehouse/inboundOrderApiTypes';
import { formatDateTimeVi } from '../../../sales/screens/orderDetail/orderDetailFormatters';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { inboundOrderTypeLabel } from '@mappers/warehouse/inboundOrderMappers';
import type { InboundOrderDetailTabId } from './inboundOrderDetailTypes';
import { ModelActivityLogPanel } from '@shared/components/ui/ModelActivityLogPanel';
import { inboundOrderActivityToRow } from '@mappers/warehouse/warehouseOrderActivityMappers';

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

function formatQty(v: number | string | null | undefined): string {
  const n = toNum(v);
  return Number.isInteger(n)
    ? String(n)
    : n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

function locationLabel(loc: InboundOrderReceiveApi['location']): string {
  if (!loc) {
    return '—';
  }
  const n = loc.name?.trim();
  const c = loc.code?.trim();
  if (n && c) {
    return `${n} (${c})`;
  }
  return n || c || '—';
}

function inboundLineThumb(it: InboundOrderItemApi): string | null {
  const p = it.product;
  return p?.thumbnail_url?.trim() || p?.image_url?.trim() || null;
}

function inboundLineTitle(it: InboundOrderItemApi): string {
  return it.product?.name?.trim() || it.sku?.trim() || 'Sản phẩm';
}

function poLineThumb(it: InboundNestedPurchaseOrderItemApi): string | null {
  const p = it.product;
  return p?.thumbnail_url?.trim() || p?.image_url?.trim() || null;
}

function poLineTitle(it: InboundNestedPurchaseOrderItemApi): string {
  return (
    it.product?.name?.trim() || it.name?.trim() || it.sku?.trim() || 'Sản phẩm'
  );
}

export type InboundOrderDetailTabPanelsProps = {
  activeTab: InboundOrderDetailTabId;
  o: InboundOrderApi;
  statusLabel: string;
  receivePct: number;
  onOpenSaleOrder?: (orderNumber: string) => void;
  onOpenPurchaseOrder?: (orderRef: string) => void;
};

export function InboundOrderDetailTabPanels({
  activeTab,
  o,
  statusLabel,
  receivePct,
  onOpenSaleOrder,
  onOpenPurchaseOrder,
}: InboundOrderDetailTabPanelsProps) {
  const styles = useThemeStyleSheet(create_InboundOrderDetailTabPanels_styles);
  const palette = useAppColors();

  const lines = o.items ?? [];
  const po = o.purchase_order;
  const poLines = po?.items ?? [];
  const typeLabel = useMemo(() => inboundOrderTypeLabel(o), [o]);

  const exp = toNum(o.total_expected_quantity);
  const rec = toNum(o.total_received_quantity);
  const dmg = toNum(o.total_damaged_quantity);

  switch (activeTab) {
    case 'info':
      return (
        <>
          <DetailCard title="Tiến độ nhận hàng" icon="layers">
            <View style={styles.metricRow}>
              <Text style={styles.metricLab}>Đã nhận / Dự kiến</Text>
              <Text style={styles.metricVal}>
                {formatQty(o.total_received_quantity)} /{' '}
                {formatQty(o.total_expected_quantity)}
              </Text>
            </View>
            {dmg > 0 ? (
              <Text style={styles.damagedHint}>
                Hỏng: {formatQty(o.total_damaged_quantity)}
              </Text>
            ) : null}
            <View style={styles.progBarBg}>
              <View style={[styles.progBarFill, { width: `${receivePct}%` }]} />
            </View>
            <Text style={styles.pctLab}>{receivePct}%</Text>
          </DetailCard>

          <DetailCard title="Thông tin phiếu nhập" icon="clipboard">
            <DetailRow
              label="Mã phiếu"
              value={o.order_number?.trim() || `#${o.id}`}
            />
            <DetailRow label="Loại" value={typeLabel} />
            <DetailRow label="Trạng thái" value={statusLabel} />
            <DetailRow
              label="Đã nhận đủ"
              value={o.is_fully_received ? 'Có' : 'Chưa'}
            />
          </DetailCard>

          <DetailCard title="Kho & seller" icon="business">
            <DetailRow
              label="Kho nhập"
              value={o.warehouse?.name?.trim() || '—'}
            />
            <DetailRow label="Seller" value={o.seller?.name?.trim() || '—'} />
          </DetailCard>

          <DetailCard title="Liên kết chứng từ" icon="link">
            <View style={styles.detailRow}>
              <Text style={styles.detailLab}>Đơn mua</Text>
              {(() => {
                const p = po?.order_number?.trim();
                if (!p) {
                  return <Text style={styles.detailVal}>-</Text>;
                }
                if (onOpenPurchaseOrder) {
                  return (
                    <Pressable
                      onPress={() => onOpenPurchaseOrder(p)}
                      hitSlop={6}
                    >
                      <Text style={styles.linkVal}>{p}</Text>
                    </Pressable>
                  );
                }
                return <Text style={styles.detailVal}>{p}</Text>;
              })()}
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLab}>Đơn bán</Text>
              {(() => {
                const s = o.sale_order?.order_number?.trim();
                if (!s) {
                  return <Text style={styles.detailVal}>-</Text>;
                }
                if (onOpenSaleOrder) {
                  return (
                    <Pressable onPress={() => onOpenSaleOrder(s)} hitSlop={6}>
                      <Text style={styles.linkVal}>{s}</Text>
                    </Pressable>
                  );
                }
                return <Text style={styles.detailVal}>{s}</Text>;
              })()}
            </View>
            <DetailRow
              label="Phiếu chuyển kho"
              value={o.transfer_order?.order_number?.trim() || '—'}
            />
          </DetailCard>

          {po?.supplier?.name ? (
            <DetailCard title="Nhà cung cấp (đơn mua)" icon="store">
              <DetailRow label="Tên" value={po.supplier.name.trim()} />
              <DetailRow
                label="Mã NCC"
                value={po.supplier.code?.trim() || '—'}
              />
            </DetailCard>
          ) : null}

          <DetailCard title="Ghi chú" icon="document">
            <DetailRow
              label="Ghi chú phiếu nhập"
              value={o.note?.trim() || '—'}
            />
            {po?.note ? (
              <DetailRow label="Ghi chú đơn mua" value={po.note.trim()} />
            ) : null}
            {po?.tracking_number ? (
              <DetailRow
                label="Vận đơn NCC"
                value={po.tracking_number.trim()}
              />
            ) : null}
          </DetailCard>

          <DetailCard title="Mốc thời gian" icon="calendar">
            <DetailRow
              label="Ngày tạo"
              value={formatDateTimeVi(o.created_at ?? null)}
            />
            <DetailRow
              label="Nhận hàng lúc"
              value={formatDateTimeVi(o.received_at ?? null)}
            />
            <DetailRow
              label="Hoàn tất lúc"
              value={formatDateTimeVi(o.completed_at ?? null)}
            />
            <DetailRow
              label="Cập nhật"
              value={formatDateTimeVi(o.updated_at ?? null)}
            />
            {po?.expected_at ? (
              <DetailRow
                label="Dự kiến đơn mua"
                value={formatDateTimeVi(po.expected_at)}
              />
            ) : null}
            {po?.cancelled_at ? (
              <DetailRow
                label="Hủy đơn mua lúc"
                value={formatDateTimeVi(po.cancelled_at)}
              />
            ) : null}
          </DetailCard>

          {exp === 0 && rec === 0 && lines.length === 0 ? (
            <DetailCard title="Tổng hợp" icon="chart">
              <DetailRow label="SL dự kiến" value="0" />
              <DetailRow label="SL đã nhận" value="0" />
            </DetailCard>
          ) : null}
        </>
      );

    case 'items':
      if (lines.length === 0) {
        return (
          <View style={styles.emptyBox}>
            <SystemIcon name="package" size={40} color={palette.textMuted} />
            <Text style={styles.emptyTxt}>
              Không có dòng nhập trên phiếu (có thể xem chi tiết đơn mua).
            </Text>
          </View>
        );
      }
      return (
        <View style={styles.itemList}>
          {lines.map(it => {
            const uri = inboundLineThumb(it);
            return (
              <View key={it.id ?? it.sku} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPh]}>
                      <SystemIcon
                        name="image"
                        size={20}
                        color={palette.textMuted}
                      />
                    </View>
                  )}
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {inboundLineTitle(it)}
                    </Text>
                    <Text style={styles.itemSku} numberOfLines={1}>
                      SKU: {it.sku?.trim() || '—'}
                    </Text>
                    <Text style={styles.itemQty}>
                      Dự kiến: {formatQty(it.expected_quantity)} · Đã nhận:{' '}
                      {formatQty(it.received_quantity)} · Tốt:{' '}
                      {formatQty(it.good_quantity)} · Hỏng:{' '}
                      {formatQty(it.damaged_quantity)}
                    </Text>
                    {it.status ? (
                      <Text style={styles.itemStatus}>
                        Trạng thái dòng: {it.status}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {(it.receives?.length ?? 0) > 0 ? (
                  <View style={styles.recvBlock}>
                    <Text style={styles.recvTitle}>Lần nhận</Text>
                    {(it.receives ?? []).map(r => (
                      <View
                        key={r.id ?? String(r.received_at)}
                        style={styles.recvLine}
                      >
                        <Text style={styles.recvTxt}>
                          SL {formatQty(r.quantity)} · Tốt{' '}
                          {formatQty(r.good_quantity)} · Hỏng{' '}
                          {formatQty(r.damaged_quantity)}
                        </Text>
                        <Text style={styles.recvLoc}>
                          Vị trí: {locationLabel(r.location)}
                        </Text>
                        <Text style={styles.recvTime}>
                          {formatDateTimeVi(r.received_at ?? null)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      );

    case 'purchase':
      if (!po?.order_number) {
        return (
          <View style={styles.emptyBox}>
            <SystemIcon name="document" size={40} color={palette.textMuted} />
            <Text style={styles.emptyTxt}>Phiếu không gắn đơn mua hàng.</Text>
          </View>
        );
      }
      return (
        <>
          <DetailCard title="Đơn mua hàng" icon="document">
            <View style={styles.detailRow}>
              <Text style={styles.detailLab}>Mã đơn</Text>
              {(() => {
                const p = po.order_number?.trim();
                if (!p) {
                  return <Text style={styles.detailVal}>-</Text>;
                }
                if (onOpenPurchaseOrder) {
                  return (
                    <Pressable
                      onPress={() => onOpenPurchaseOrder(p)}
                      hitSlop={6}
                    >
                      <Text style={styles.linkVal}>{p}</Text>
                    </Pressable>
                  );
                }
                return <Text style={styles.detailVal}>{p}</Text>;
              })()}
            </View>
            <DetailRow label="Trạng thái" value={po.status?.trim() || '—'} />
            <DetailRow label="Tổng tiền" value={String(po.total ?? '—')} />
          </DetailCard>
          {poLines.length === 0 ? (
            <Text style={styles.boxEmpty}>
              Đơn mua không có dòng chi tiết trong phản hồi.
            </Text>
          ) : (
            <View style={styles.itemList}>
              {poLines.map(pit => {
                const uri = poLineThumb(pit);
                return (
                  <View key={pit.id ?? pit.sku} style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      {uri ? (
                        <Image source={{ uri }} style={styles.thumb} />
                      ) : (
                        <View style={[styles.thumb, styles.thumbPh]}>
                          <SystemIcon
                            name="image"
                            size={20}
                            color={palette.textMuted}
                          />
                        </View>
                      )}
                      <View style={styles.itemBody}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {poLineTitle(pit)}
                        </Text>
                        <Text style={styles.itemSku} numberOfLines={1}>
                          SKU: {pit.sku?.trim() || '—'}
                        </Text>
                        <Text style={styles.itemQty}>
                          Đặt: {formatQty(pit.quantity)} · Đã nhận:{' '}
                          {formatQty(pit.received_quantity)}
                          {pit.unit ? ` · Đơn vị: ${pit.unit}` : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      );

    case 'activity':
      return (
        <ModelActivityLogPanel
          modelType="InboundOrder"
          modelId={o.id}
          i18nPrefix="warehouseInbound.detail"
          toRow={inboundOrderActivityToRow}
        />
      );

    default:
      return null;
  }
}

function create_InboundOrderDetailTabPanels_styles(c: AppColorPalette) {
  return StyleSheet.create({
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricLab: { fontSize: 12, fontWeight: '600', color: c.textMuted },
    metricVal: { fontSize: 14, fontWeight: '800', color: c.textPrimary },
    damagedHint: {
      fontSize: 12,
      fontWeight: '700',
      color: c.orange,
      marginBottom: 8,
    },
    pctLab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
    progBarBg: {
      height: 8,
      borderRadius: 4,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    progBarFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: c.teal,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    detailLab: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      maxWidth: '44%',
    },
    detailVal: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      textAlign: 'right',
    },
    linkVal: {
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
      color: c.cyan,
      textAlign: 'right',
      textDecorationLine: 'underline',
    },
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 12,
    },
    emptyTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    itemList: { gap: 10 },
    itemCard: {
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 10,
    },
    itemRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    thumb: {
      width: 52,
      height: 52,
      borderRadius: 8,
      backgroundColor: c.bgInput,
    },
    thumbPh: { alignItems: 'center', justifyContent: 'center' },
    itemBody: { flex: 1, minWidth: 0 },
    itemName: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 4,
    },
    itemSku: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 4,
    },
    itemQty: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 17,
    },
    itemStatus: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      marginTop: 6,
    },
    recvBlock: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    recvTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textSecondary,
      marginBottom: 8,
    },
    recvLine: { marginBottom: 10 },
    recvTxt: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
    recvLoc: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 2,
    },
    recvTime: { fontSize: 11, color: c.textMuted, marginTop: 2 },
    boxEmpty: {
      fontSize: 13,
      color: c.textMuted,
      fontStyle: 'italic',
      paddingHorizontal: 4,
      marginTop: 8,
    },
  });
}
