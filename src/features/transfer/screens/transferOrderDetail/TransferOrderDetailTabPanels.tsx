import React, { useMemo } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type {
  TransferOrderApi,
  TransferOrderInboundNestedApi,
  TransferOrderOutboundNestedApi,
} from '@services/warehouse/transferOrderApiTypes';
import { formatDateTimeVi } from '../../../sales/screens/orderDetail/orderDetailFormatters';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { transferOrderStatusLabel } from '@mappers/warehouse/transferOrderMappers';
import type { TransferOrderDetailTabId } from './transferOrderDetailTypes';

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

function outboundStatusLabel(raw: string | null | undefined): string {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'completed') {
    return 'Hoàn thành';
  }
  if (s === 'pending') {
    return 'Chờ xử lý';
  }
  return raw?.trim() || '—';
}

export type TransferOrderDetailTabPanelsProps = {
  activeTab: TransferOrderDetailTabId;
  t: TransferOrderApi;
  statusLabel: string;
  onOpenOutboundOrder?: (orderNumber: string) => void;
  onOpenInboundOrder?: (orderNumber: string) => void;
  onOpenSaleOrder?: (orderNumber: string) => void;
};

export function TransferOrderDetailTabPanels({
  activeTab,
  t,
  statusLabel,
  onOpenOutboundOrder,
  onOpenInboundOrder,
  onOpenSaleOrder,
}: TransferOrderDetailTabPanelsProps) {
  const styles = useThemeStyleSheet(create_TransferOrderDetailTabPanels_styles);
  const palette = useAppColors();

  const outList = useMemo(
    () =>
      [...(t.outbound_orders ?? [])].filter(
        Boolean,
      ) as TransferOrderOutboundNestedApi[],
    [t.outbound_orders],
  );
  const inList = useMemo(
    () =>
      [...(t.inbound_orders ?? [])].filter(
        Boolean,
      ) as TransferOrderInboundNestedApi[],
    [t.inbound_orders],
  );

  const creatorName = t.creator?.name?.trim() || '—';

  switch (activeTab) {
    case 'info':
      return (
        <>
          <DetailCard title="Thông tin cơ bản" icon="clipboard">
            <View style={styles.rowIcon}>
              <SystemIcon name="business" size={18} color={palette.blue} />
              <View style={styles.rowIconBody}>
                <Text style={styles.rowIconLab}>Kho xuất</Text>
                <Text style={styles.rowIconVal}>
                  {t.from_warehouse?.name?.trim() || '—'}
                </Text>
              </View>
            </View>
            <View style={styles.rowIcon}>
              <SystemIcon name="business" size={18} color={palette.green} />
              <View style={styles.rowIconBody}>
                <Text style={styles.rowIconLab}>Kho nhập</Text>
                <Text style={styles.rowIconVal}>
                  {t.to_warehouse?.name?.trim() || '—'}
                </Text>
              </View>
            </View>
            <DetailRow label="Người tạo" value={creatorName} />
            <DetailRow
              label="Ngày tạo"
              value={formatDateTimeVi(t.created_at ?? null)}
            />
            <DetailRow label="Trạng thái" value={statusLabel} />
            <DetailRow label="Ghi chú" value={t.note?.trim() || '—'} />
          </DetailCard>

          <DetailCard title="Vận chuyển / bàn giao" icon="truck">
            <DetailRow label="Tài xế" value={t.driver_name?.trim() || '—'} />
            <DetailRow
              label="Điện thoại"
              value={t.driver_phone?.trim() || '—'}
            />
            <DetailRow
              label="Biển số xe"
              value={t.vehicle_number?.trim() || '—'}
            />
            <DetailRow
              label="Ghi chú bàn giao"
              value={t.handover_note?.trim() || '—'}
            />
            <DetailRow
              label="Bắt đầu bàn giao"
              value={formatDateTimeVi(t.handover_started_at ?? null)}
            />
            <DetailRow
              label="Hoàn tất bàn giao"
              value={formatDateTimeVi(t.handover_completed_at ?? null)}
            />
            <DetailRow
              label="Đã bàn giao"
              value={t.is_handover_completed ? 'Có' : 'Chưa'}
            />
          </DetailCard>

          <DetailCard title="Tiến trình" icon="time">
            <View style={styles.timelineItem}>
              <SystemIcon name="checkCircle" size={18} color={palette.green} />
              <View style={styles.timelineBody}>
                <Text style={styles.timelineTitle}>Đã tạo</Text>
                <Text style={styles.timelineMeta}>
                  {formatDateTimeVi(t.created_at ?? null)}
                  {creatorName !== '—' ? ` · ${creatorName}` : ''}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <SystemIcon name="checkCircle" size={18} color={palette.green} />
              <View style={styles.timelineBody}>
                <Text style={styles.timelineTitle}>Đã xuất kho</Text>
                <Text style={styles.timelineMeta}>
                  {formatDateTimeVi(t.shipped_at ?? null)}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <SystemIcon name="checkCircle" size={18} color={palette.green} />
              <View style={styles.timelineBody}>
                <Text style={styles.timelineTitle}>Đã nhận</Text>
                <Text style={styles.timelineMeta}>
                  {formatDateTimeVi(t.received_at ?? null)}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <SystemIcon name="checkCircle" size={18} color={palette.green} />
              <View style={styles.timelineBody}>
                <Text style={styles.timelineTitle}>Đã hoàn thành</Text>
                <Text style={styles.timelineMeta}>
                  {formatDateTimeVi(t.completed_at ?? null)}
                </Text>
              </View>
            </View>
          </DetailCard>
        </>
      );

    case 'outbound':
      if (outList.length === 0) {
        return (
          <View style={styles.emptyBox}>
            <SystemIcon name="truck" size={40} color={palette.textMuted} />
            <Text style={styles.emptyTxt}>Chưa có phiếu xuất kho.</Text>
          </View>
        );
      }
      return (
        <>
          {outList.map(ob => (
            <DetailCard
              key={ob.id ?? ob.order_number}
              title={ob.order_number ?? 'Phiếu xuất'}
              icon="truck"
            >
              <DetailRow
                label="Trạng thái"
                value={outboundStatusLabel(ob.status)}
              />
              <DetailRow label="Loại" value={ob.type?.trim() || '—'} />
              <DetailRow
                label="Tiến độ lấy"
                value={`${toNum(ob.pick_progress)}%`}
              />
              <DetailRow
                label="Đối tác VC"
                value={ob.shipping_partner_name?.trim() || '—'}
              />
              <View style={styles.detailRow}>
                <Text style={styles.detailLab}>Mã phiếu</Text>
                {(() => {
                  const ordNum = ob.order_number?.trim();
                  if (!ordNum) {
                    return <Text style={styles.detailVal}>-</Text>;
                  }
                  if (onOpenOutboundOrder) {
                    return (
                      <Pressable
                        onPress={() => onOpenOutboundOrder(ordNum)}
                        hitSlop={6}
                      >
                        <Text style={styles.linkVal}>{ordNum}</Text>
                      </Pressable>
                    );
                  }
                  return <Text style={styles.detailVal}>{ordNum}</Text>;
                })()}
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLab}>Đơn bán</Text>
                {(() => {
                  const so = ob.sale_order?.order_number?.trim();
                  if (!so) {
                    return <Text style={styles.detailVal}>-</Text>;
                  }
                  if (onOpenSaleOrder) {
                    return (
                      <Pressable
                        onPress={() => onOpenSaleOrder(so)}
                        hitSlop={6}
                      >
                        <Text style={styles.linkVal}>{so}</Text>
                      </Pressable>
                    );
                  }
                  return <Text style={styles.detailVal}>{so}</Text>;
                })()}
              </View>
              {(ob.items ?? []).length > 0 ? (
                <View style={styles.subList}>
                  <Text style={styles.subListTitle}>Dòng hàng</Text>
                  {(ob.items ?? []).map(it => (
                    <Text key={it.id ?? it.sku} style={styles.subLine}>
                      {it.sku?.trim() || '—'} · SL {toNum(it.quantity)} · Đã lấy{' '}
                      {toNum(it.picked_quantity)} ({toNum(it.pick_progress)}%)
                    </Text>
                  ))}
                </View>
              ) : null}
            </DetailCard>
          ))}
        </>
      );

    case 'boxes':
      return (
        <DetailCard title="Thùng & quét" icon="package">
          <DetailRow
            label="Tổng thùng"
            value={String(toNum(t.total_boxes_count))}
          />
          <DetailRow
            label="Đã quét"
            value={String(toNum(t.scanned_boxes_count))}
          />
          <DetailRow
            label="Đã nhận tại kho đích"
            value={String(toNum(t.received_boxes_count))}
          />
          <DetailRow
            label="Tổng SL hàng (theo phiếu)"
            value={String(toNum(t.total_items_quantity))}
          />
          <DetailRow
            label="Đã quét SL hàng"
            value={String(toNum(t.scanned_items_quantity))}
          />
          <DetailRow
            label="Dòng đã quét đủ"
            value={String(toNum(t.fully_scanned_items_count))}
          />
        </DetailCard>
      );

    case 'inbound':
      if (inList.length === 0) {
        return (
          <View style={styles.emptyBox}>
            <SystemIcon name="download" size={40} color={palette.textMuted} />
            <Text style={styles.emptyTxt}>Chưa có phiếu nhập kho.</Text>
          </View>
        );
      }
      return (
        <>
          {inList.map(ib => (
            <DetailCard
              key={ib.id ?? ib.order_number}
              title={ib.order_number ?? 'Phiếu nhập'}
              icon="download"
            >
              <DetailRow
                label="Trạng thái"
                value={transferOrderStatusLabel(ib.status)}
              />
              <DetailRow label="Loại" value={ib.type?.trim() || '—'} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLab}>Mã phiếu</Text>
                {(() => {
                  const inn = ib.order_number?.trim();
                  if (!inn) {
                    return <Text style={styles.detailVal}>-</Text>;
                  }
                  if (onOpenInboundOrder) {
                    return (
                      <Pressable
                        onPress={() => onOpenInboundOrder(inn)}
                        hitSlop={6}
                      >
                        <Text style={styles.linkVal}>{inn}</Text>
                      </Pressable>
                    );
                  }
                  return <Text style={styles.detailVal}>{inn}</Text>;
                })()}
              </View>
            </DetailCard>
          ))}
        </>
      );

    default:
      return null;
  }
}

function create_TransferOrderDetailTabPanels_styles(c: AppColorPalette) {
  return StyleSheet.create({
    rowIcon: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowIconBody: { flex: 1 },
    rowIconLab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 4,
    },
    rowIconVal: { fontSize: 14, fontWeight: '800', color: c.textPrimary },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    timelineBody: { flex: 1 },
    timelineTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 4,
    },
    timelineMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 18,
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
    subList: { marginTop: 10 },
    subListTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textSecondary,
      marginBottom: 8,
    },
    subLine: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: 6,
      lineHeight: 18,
    },
  });
}
