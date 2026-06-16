import React, { useMemo } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type {
  PackingOrderApi,
  PackingOrderBoxApi,
  PackingOrderBoxItemApi,
} from '@services/warehouse/packingOrderApiTypes';
import { formatDateTimeVi } from '../../../sales/screens/orderDetail/orderDetailFormatters';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import type { PackingOrderDetailTabId } from './packingOrderDetailTypes';
import { ModelActivityLogPanel } from '@shared/components/ui/ModelActivityLogPanel';
import { packingOrderActivityToRow } from '@mappers/warehouse/warehouseOrderActivityMappers';

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

function formatQty(v: string | number | null | undefined): string {
  const n = toNum(v);
  return Number.isInteger(n)
    ? String(n)
    : n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

function boxStatusLabel(raw: string | null | undefined): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'pending') {
    return 'Chờ xử lý';
  }
  if (s === 'packing') {
    return 'Đang đóng gói';
  }
  if (s === 'completed') {
    return 'Hoàn tất';
  }
  if (s === 'cancelled') {
    return 'Đã hủy';
  }
  return raw?.trim() || '—';
}

function itemThumb(it: PackingOrderBoxItemApi): string | null {
  const t =
    it.product_thumbnail?.trim() || it.product?.thumbnail_url?.trim() || null;
  return t;
}

function itemTitle(it: PackingOrderBoxItemApi): string {
  return (
    it.product_name?.trim() ||
    it.product?.name?.trim() ||
    it.sku?.trim() ||
    'Sản phẩm'
  );
}

function formatWeightKg(v: number | string | null | undefined): string {
  const n = toNum(v);
  if (n <= 0) {
    return '—';
  }
  return `${n.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} kg`;
}

export type PackingOrderDetailTabPanelsProps = {
  activeTab: PackingOrderDetailTabId;
  po: PackingOrderApi;
  statusLabel: string;
  onOpenSaleOrder?: (orderNumber: string) => void;
};

export function PackingOrderDetailTabPanels({
  activeTab,
  po,
  statusLabel,
  onOpenSaleOrder,
}: PackingOrderDetailTabPanelsProps) {
  const styles = useThemeStyleSheet(create_PackingOrderDetailTabPanels_styles);
  const palette = useAppColors();

  const pickPct = clampPct(toNum(po.pick_progress));
  const packPct = clampPct(toNum(po.packing_progress));
  const summary = po.summary;
  const packedBoxes = toNum(summary?.packed_boxes);
  const totalBoxes = toNum(summary?.total_boxes) || toNum(po.box_count);
  const totalItems = toNum(po.total_items);
  const saleNo = po.sale_order?.order_number?.trim() ?? '';

  const boxes = useMemo(
    () => [...(po.boxes ?? [])].filter(Boolean) as PackingOrderBoxApi[],
    [po.boxes],
  );

  switch (activeTab) {
    case 'info':
      return (
        <>
          <DetailCard title="Tiến độ" icon="layers">
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Lấy hàng</Text>
                <Text style={styles.metricVal}>{pickPct}%</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Đóng gói</Text>
                <Text style={styles.metricVal}>{packPct}%</Text>
              </View>
            </View>
            <Text style={styles.progCaption}>Tiến độ lấy hàng</Text>
            <View style={styles.progBarBg}>
              <View style={[styles.progBarFill, { width: `${pickPct}%` }]} />
            </View>
            <Text style={[styles.progCaption, styles.progCaptionSecond]}>
              Tiến độ đóng gói
            </Text>
            <View style={styles.progBarBg}>
              <View
                style={[styles.progBarFillPack, { width: `${packPct}%` }]}
              />
            </View>
          </DetailCard>

          <DetailCard title="Thông tin đơn đóng gói" icon="clipboard">
            <DetailRow
              label="Mã đơn đóng gói"
              value={po.order_number?.trim() || `#${po.id}`}
            />
            <View style={styles.detailRow}>
              <Text style={styles.detailLab}>Đơn hàng</Text>
              {saleNo && onOpenSaleOrder ? (
                <Pressable onPress={() => onOpenSaleOrder(saleNo)} hitSlop={6}>
                  <Text style={styles.linkVal}>{saleNo}</Text>
                </Pressable>
              ) : (
                <Text style={styles.detailVal}>{saleNo || '—'}</Text>
              )}
            </View>
            <DetailRow
              label="Quản lý Seller"
              value={po.seller?.name?.trim() || '—'}
            />
            <DetailRow
              label="Kho hàng"
              value={po.warehouse?.name?.trim() || '—'}
            />
            <DetailRow label="Trạng thái" value={statusLabel} />
          </DetailCard>

          <DetailCard title="Thông tin phân công" icon="person">
            <DetailRow
              label="Người thực hiện"
              value={po.assigned_user?.name?.trim() || 'Chưa phân công'}
            />
            <DetailRow
              label="Thời gian phân công"
              value={formatDateTimeVi(po.assigned_at ?? null)}
            />
            <DetailRow
              label="Vị trí chờ xuất"
              value={
                po.staging_location?.name?.trim() ||
                po.staging_location?.code?.trim() ||
                '—'
              }
            />
            <DetailRow label="Ghi chú" value={po.note?.trim() || '—'} />
          </DetailCard>

          <DetailCard title="Thời gian" icon="calendar">
            <DetailRow
              label="Ngày tạo"
              value={formatDateTimeVi(po.created_at ?? null)}
            />
            <DetailRow
              label="Thời gian bắt đầu"
              value={formatDateTimeVi(po.started_at ?? null)}
            />
            <DetailRow
              label="Thời gian hoàn thành"
              value={formatDateTimeVi(po.completed_at ?? null)}
            />
            <DetailRow
              label="Ngày cập nhật"
              value={formatDateTimeVi(po.updated_at ?? null)}
            />
          </DetailCard>

          <DetailCard title="Thống kê" icon="chart">
            <DetailRow
              label="Tổng số hộp"
              value={totalBoxes > 0 ? `${totalBoxes} hộp` : '—'}
            />
            <DetailRow label="Hộp đã đóng" value={String(packedBoxes)} />
            <DetailRow
              label="Tổng sản phẩm"
              value={totalItems > 0 ? String(totalItems) : '—'}
            />
            <DetailRow
              label="Tổng trọng lượng"
              value={formatWeightKg(po.total_weight)}
            />
          </DetailCard>

          {po.outbound_order?.order_number?.trim() ? (
            <DetailCard title="Xuất kho" icon="truck">
              <DetailRow
                label="Mã phiếu xuất"
                value={po.outbound_order.order_number.trim()}
              />
            </DetailCard>
          ) : null}
        </>
      );

    case 'boxes':
      if (boxes.length === 0) {
        return (
          <View style={styles.emptyBox}>
            <SystemIcon name="package" size={40} color={palette.textMuted} />
            <Text style={styles.emptyTxt}>Chưa có dữ liệu hộp.</Text>
          </View>
        );
      }
      return (
        <>
          {boxes.map(box => {
            const items = box.items ?? [];
            const bn = box.box_number ?? boxes.indexOf(box) + 1;
            return (
              <DetailCard key={box.id ?? bn} title={`Hộp ${bn}`} icon="package">
                <DetailRow label="Mã hộp" value={box.box_code?.trim() || '—'} />
                <DetailRow
                  label="Trạng thái"
                  value={boxStatusLabel(box.status)}
                />
                <DetailRow
                  label="SL dòng / đã lấy"
                  value={`${items.length} dòng · ${formatQty(
                    box.total_items_quantity,
                  )} SP`}
                />
                {items.length === 0 ? (
                  <Text style={styles.boxEmptyItems}>
                    Không có dòng sản phẩm.
                  </Text>
                ) : (
                  <View style={styles.itemList}>
                    {items.map(it => {
                      const uri = itemThumb(it);
                      return (
                        <View
                          key={it.id ?? `${it.sku}-${it.product?.id ?? 'x'}`}
                          style={styles.itemRow}
                        >
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
                              SL: {formatQty(it.quantity)} · Đã lấy:{' '}
                              {formatQty(it.picked_quantity)} · Đã đóng:{' '}
                              {formatQty(it.packed_quantity)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </DetailCard>
            );
          })}
        </>
      );

    case 'activity':
      return (
        <ModelActivityLogPanel
          modelType="PackingOrder"
          modelId={po.id}
          i18nPrefix="warehousePacking.detail"
          toRow={packingOrderActivityToRow}
        />
      );

    default:
      return null;
  }
}

function create_PackingOrderDetailTabPanels_styles(c: AppColorPalette) {
  return StyleSheet.create({
    metricsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    metric: { flex: 1 },
    metricLab: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 4,
    },
    metricVal: { fontSize: 16, fontWeight: '800', color: c.textPrimary },
    progCaption: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 6,
    },
    progCaptionSecond: { marginTop: 10 },
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
    progBarFillPack: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: c.green,
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
    boxEmptyItems: {
      fontSize: 13,
      color: c.textMuted,
      fontStyle: 'italic',
      marginTop: 8,
    },
    itemList: { marginTop: 8, gap: 10 },
    itemRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    thumb: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: c.bgInput,
    },
    thumbPh: { alignItems: 'center', justifyContent: 'center' },
    itemBody: { flex: 1, minWidth: 0 },
    itemName: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 2,
    },
    itemSku: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 4,
    },
    itemQty: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 16,
    },
  });
}
