import React, { useMemo } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type {
  OutboundNestedPackingBoxApi,
  OutboundOrderApi,
  OutboundOrderItemApi,
} from '@services/warehouse/outboundOrderApiTypes';
import { formatDateTimeVi } from '../../../sales/screens/orderDetail/orderDetailFormatters';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { outboundOrderTypeLabel } from '@mappers/warehouse/outboundOrderMappers';
import type { OutboundOrderDetailTabId } from './outboundOrderDetailTypes';
import { ModelActivityLogPanel } from '@shared/components/ui/ModelActivityLogPanel';
import { outboundOrderActivityToRow } from '@mappers/warehouse/warehouseOrderActivityMappers';

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function formatQty(v: number | string | null | undefined): string {
  const n = toNum(v);
  return Number.isInteger(n)
    ? String(n)
    : n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

function recipientTypeLabel(raw: string | null | undefined): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'customer') {
    return 'Khách hàng';
  }
  if (s === 'warehouse') {
    return 'Kho';
  }
  return raw?.trim() || '—';
}

function handoverModeLabel(raw: string | null | undefined): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'box_scan') {
    return 'Quét hộp';
  }
  return raw?.trim() || '—';
}

function packingStatusLabel(raw: string | null | undefined): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'pending') {
    return 'Chờ đóng gói';
  }
  if (s === 'packing') {
    return 'Đang đóng gói';
  }
  if (s === 'packed') {
    return 'Đã đóng gói';
  }
  if (s === 'completed') {
    return 'Hoàn tất';
  }
  return raw?.trim() || '—';
}

function boxStatusLabel(raw: string | null | undefined): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'packed') {
    return 'Đã đóng';
  }
  if (s === 'pending') {
    return 'Chờ';
  }
  return raw?.trim() || '—';
}

function itemThumb(it: OutboundOrderItemApi): string | null {
  const p = it.product;
  return p?.thumbnail_url?.trim() || p?.image_url?.trim() || null;
}

function itemTitle(it: OutboundOrderItemApi): string {
  return it.product?.name?.trim() || it.sku?.trim() || 'Sản phẩm';
}

export type OutboundOrderDetailTabPanelsProps = {
  activeTab: OutboundOrderDetailTabId;
  o: OutboundOrderApi;
  statusLabel: string;
  onOpenSaleOrder?: (orderNumber: string) => void;
  onOpenPackingOrder?: (orderNumber: string) => void;
};

export function OutboundOrderDetailTabPanels({
  activeTab,
  o,
  statusLabel,
  onOpenSaleOrder,
  onOpenPackingOrder,
}: OutboundOrderDetailTabPanelsProps) {
  const styles = useThemeStyleSheet(create_OutboundOrderDetailTabPanels_styles);
  const palette = useAppColors();

  const items = o.items ?? [];
  const pickPct = clampPct(toNum(o.pick_progress));
  const pk = o.packing_order;
  const boxes = useMemo(
    () =>
      [...(pk?.boxes ?? [])].filter(Boolean) as OutboundNestedPackingBoxApi[],
    [pk?.boxes],
  );

  const typeLabel = useMemo(() => outboundOrderTypeLabel(o), [o]);

  switch (activeTab) {
    case 'info':
      return (
        <>
          <DetailCard title="Tiến độ lấy hàng" icon="layers">
            <View style={styles.metricRow}>
              <Text style={styles.metricLab}>Đã lấy / Tổng SL</Text>
              <Text style={styles.metricVal}>
                {formatQty(o.total_picked_quantity)} /{' '}
                {formatQty(o.total_quantity)}
              </Text>
            </View>
            <View style={styles.progBarBg}>
              <View style={[styles.progBarFill, { width: `${pickPct}%` }]} />
            </View>
            <Text style={styles.pctLab}>{pickPct}%</Text>
          </DetailCard>

          <DetailCard title="Thông tin phiếu xuất" icon="clipboard">
            <DetailRow
              label="Mã phiếu"
              value={o.order_number?.trim() || `#${o.id}`}
            />
            <DetailRow label="Loại" value={typeLabel} />
            <DetailRow label="Trạng thái" value={statusLabel} />
            <DetailRow
              label="Cần đóng gói"
              value={o.requires_packing ? 'Có' : 'Không'}
            />
            <DetailRow
              label="Cho phép sửa"
              value={o.can_edit ? 'Có' : 'Không'}
            />
            <DetailRow
              label="Cho phép hủy"
              value={o.can_cancel ? 'Có' : 'Không'}
            />
          </DetailCard>

          <DetailCard title="Kho & đối tác" icon="business">
            <DetailRow
              label="Kho xuất"
              value={o.warehouse?.name?.trim() || '—'}
            />
            <DetailRow
              label="Kho đích"
              value={o.destination_warehouse?.name?.trim() || '—'}
            />
            <DetailRow label="Seller" value={o.seller?.name?.trim() || '—'} />
            <DetailRow
              label="Đối tác VC"
              value={o.shipping_partner_name?.trim() || '—'}
            />
          </DetailCard>

          <DetailCard title="Liên kết chứng từ" icon="link">
            <View style={styles.detailRow}>
              <Text style={styles.detailLab}>Đơn bán</Text>
              {(() => {
                const so = o.sale_order?.order_number?.trim();
                if (!so) {
                  return <Text style={styles.detailVal}>-</Text>;
                }
                if (onOpenSaleOrder) {
                  return (
                    <Pressable onPress={() => onOpenSaleOrder(so)} hitSlop={6}>
                      <Text style={styles.linkVal}>{so}</Text>
                    </Pressable>
                  );
                }
                return <Text style={styles.detailVal}>{so}</Text>;
              })()}
            </View>
            <DetailRow
              label="Phiếu chuyển kho"
              value={o.transfer_order?.order_number?.trim() || '—'}
            />
            <DetailRow
              label="Phiếu xuất nguồn"
              value={o.source_outbound_order?.order_number?.trim() || '—'}
            />
            {o.source_outbound_order?.warehouse?.name ? (
              <DetailRow
                label="Kho nguồn"
                value={o.source_outbound_order.warehouse.name.trim()}
              />
            ) : null}
          </DetailCard>

          <DetailCard title="Giao nhận" icon="truck">
            <DetailRow
              label="Người nhận"
              value={o.recipient_name?.trim() || '—'}
            />
            <DetailRow
              label="Loại người nhận"
              value={recipientTypeLabel(o.recipient_type)}
            />
            <DetailRow
              label="Chế độ bàn giao"
              value={handoverModeLabel(o.handover_mode)}
            />
            <DetailRow
              label="Đã bắt đầu bàn giao"
              value={o.is_handover_started ? 'Có' : 'Chưa'}
            />
            <DetailRow
              label="Đã hoàn tất bàn giao"
              value={o.is_handover_completed ? 'Có' : 'Chưa'}
            />
            <DetailRow
              label="Bắt đầu bàn giao lúc"
              value={formatDateTimeVi(o.handover_started_at ?? null)}
            />
          </DetailCard>

          <DetailCard title="Duyệt / từ chối" icon="shield">
            <DetailRow
              label="Người duyệt"
              value={o.reviewer?.name?.trim() || '—'}
            />
            <DetailRow
              label="Thời gian duyệt"
              value={formatDateTimeVi(o.reviewed_at ?? null)}
            />
            <DetailRow
              label="Lý do từ chối"
              value={o.rejection_reason?.trim() || '—'}
            />
          </DetailCard>

          <DetailCard title="Ghi chú" icon="document">
            <DetailRow label="Ghi chú" value={o.note?.trim() || '—'} />
            <DetailRow
              label="Lý do yêu cầu"
              value={o.request_reason?.trim() || '—'}
            />
          </DetailCard>

          <DetailCard title="Mốc thời gian" icon="calendar">
            <DetailRow
              label="Ngày tạo"
              value={formatDateTimeVi(o.created_at ?? null)}
            />
            <DetailRow
              label="Lấy hàng lúc"
              value={formatDateTimeVi(o.picked_at ?? null)}
            />
            <DetailRow
              label="Đóng gói lúc"
              value={formatDateTimeVi(o.packed_at ?? null)}
            />
            <DetailRow
              label="Xuất kho / giao lúc"
              value={formatDateTimeVi(o.shipped_at ?? null)}
            />
            <DetailRow
              label="Hoàn tất lúc"
              value={formatDateTimeVi(o.completed_at ?? null)}
            />
            <DetailRow
              label="Cập nhật"
              value={formatDateTimeVi(o.updated_at ?? null)}
            />
          </DetailCard>
        </>
      );

    case 'items':
      if (items.length === 0) {
        return (
          <View style={styles.emptyBox}>
            <SystemIcon name="package" size={40} color={palette.textMuted} />
            <Text style={styles.emptyTxt}>Không có dòng sản phẩm.</Text>
          </View>
        );
      }
      return (
        <View style={styles.itemList}>
          {items.map(it => {
            const uri = itemThumb(it);
            const pp = clampPct(toNum(it.pick_progress));
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
                      {itemTitle(it)}
                    </Text>
                    <Text style={styles.itemSku} numberOfLines={1}>
                      SKU: {it.sku?.trim() || '—'}
                    </Text>
                    <Text style={styles.itemQty}>
                      Đặt: {formatQty(it.quantity)} · Đã lấy:{' '}
                      {formatQty(it.picked_quantity)} · Còn:{' '}
                      {formatQty(it.remaining_quantity)}
                    </Text>
                    <Text style={styles.itemProg}>Tiến độ lấy: {pp}%</Text>
                    <View style={styles.miniBarBg}>
                      <View style={[styles.miniBarFill, { width: `${pp}%` }]} />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      );

    case 'packing':
      if (!pk?.order_number) {
        return (
          <View style={styles.emptyBox}>
            <SystemIcon name="cube" size={40} color={palette.textMuted} />
            <Text style={styles.emptyTxt}>
              Phiếu này không gắn lệnh đóng gói.
            </Text>
          </View>
        );
      }
      return (
        <>
          <DetailCard title="Lệnh đóng gói" icon="cube">
            <View style={styles.detailRow}>
              <Text style={styles.detailLab}>Mã lệnh</Text>
              {(() => {
                const pn = pk.order_number?.trim();
                if (!pn) {
                  return <Text style={styles.detailVal}>-</Text>;
                }
                if (onOpenPackingOrder) {
                  return (
                    <Pressable
                      onPress={() => onOpenPackingOrder(pn)}
                      hitSlop={6}
                    >
                      <Text style={styles.linkVal}>{pn}</Text>
                    </Pressable>
                  );
                }
                return <Text style={styles.detailVal}>{pn}</Text>;
              })()}
            </View>
            <DetailRow
              label="Trạng thái"
              value={packingStatusLabel(pk.status)}
            />
            <DetailRow
              label="Hộp"
              value={
                pk.summary?.total_boxes != null
                  ? `${toNum(pk.summary.packed_boxes)}/${toNum(
                      pk.summary.total_boxes,
                    )} đã đóng`
                  : `${toNum(pk.box_count)} hộp`
              }
            />
          </DetailCard>
          {boxes.length === 0 ? (
            <Text style={styles.boxEmpty}>Chưa có dữ liệu hộp.</Text>
          ) : (
            boxes.map(box => {
              const bn = box.box_number ?? boxes.indexOf(box) + 1;
              const bItems = box.items ?? [];
              return (
                <DetailCard
                  key={box.id ?? bn}
                  title={`Hộp ${bn}`}
                  icon="package"
                >
                  <DetailRow
                    label="Mã hộp"
                    value={box.box_code?.trim() || '—'}
                  />
                  <DetailRow
                    label="Trạng thái"
                    value={boxStatusLabel(box.status)}
                  />
                  <DetailRow
                    label="Vận đơn"
                    value={box.tracking_number?.trim() || '—'}
                  />
                  <DetailRow
                    label="Trọng lượng"
                    value={
                      toNum(box.actual_weight) > 0
                        ? `${formatQty(box.actual_weight)} kg`
                        : '—'
                    }
                  />
                  {bItems.length > 0 ? (
                    <View style={styles.subItemList}>
                      {bItems.map(bi => (
                        <Text key={bi.id ?? bi.sku} style={styles.subItemLine}>
                          {bi.sku?.trim() || '—'} · SL {formatQty(bi.quantity)}{' '}
                          · Đã lấy {formatQty(bi.picked_quantity)}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </DetailCard>
              );
            })
          )}
        </>
      );

    case 'activity':
      return (
        <ModelActivityLogPanel
          modelType="OutboundOrder"
          modelId={o.id}
          i18nPrefix="warehouseOutbound.detail"
          toRow={outboundOrderActivityToRow}
        />
      );

    default:
      return null;
  }
}

function create_OutboundOrderDetailTabPanels_styles(c: AppColorPalette) {
  return StyleSheet.create({
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricLab: { fontSize: 12, fontWeight: '600', color: c.textMuted },
    metricVal: { fontSize: 14, fontWeight: '800', color: c.textPrimary },
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
    itemProg: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      marginTop: 6,
      marginBottom: 4,
    },
    miniBarBg: {
      height: 5,
      borderRadius: 3,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    miniBarFill: { height: '100%', backgroundColor: c.teal, borderRadius: 3 },
    boxEmpty: {
      fontSize: 13,
      color: c.textMuted,
      fontStyle: 'italic',
      paddingHorizontal: 4,
      marginTop: 8,
    },
    subItemList: { marginTop: 8, gap: 6 },
    subItemLine: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
  });
}
