import React, { useMemo } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type {
  PurchaseOrderApi,
  PurchaseOrderInboundApi,
  PurchaseOrderItemApi,
} from '@services/warehouse/purchaseOrderApiTypes';
import type { PurchaseOrderListRow } from '../../purchase/purchaseTypes';
import {
  formatDateTimeVi,
  formatDateVi,
  formatMoneyFromApi,
} from '../../../sales/screens/orderDetail/orderDetailFormatters';
import { CanvasDetailLineItemCard } from '@shared/components/ui/canvasDetail/CanvasDetailLineItemCard';
import { CanvasDetailMetricPair, CanvasDetailProgressCard } from '@shared/components/ui/canvasDetail/CanvasDetailMetrics';
import { useCanvasDetailStyles } from '@shared/components/ui/canvasDetail/canvasDetailTheme';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import type { PurchaseOrderDetailTabId } from './poDetailTypes';
import { PurchaseOrderDetailActivityLogPanel } from './PurchaseOrderDetailActivityLogPanel';
import { PurchaseOrderDetailDocumentsPanel } from './PurchaseOrderDetailDocumentsPanel';

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : 0;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

function inboundStatusLabel(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'pending') {
    return 'Chờ nhận';
  }
  if (s === 'completed' || s === 'received') {
    return 'Hoàn thành';
  }
  return status?.trim() || '—';
}

function lineOrderedQty(it: PurchaseOrderItemApi): number {
  const exp = toNum(it.expected_quantity);
  return exp > 0 ? exp : toNum(it.quantity);
}

function lineReceivedQty(it: PurchaseOrderItemApi): number {
  return toNum(it.received_quantity);
}

function compareStatusLabel(diff: number): {
  label: string;
  tone: 'ok' | 'bad' | 'warn';
} {
  if (diff === 0) {
    return { label: 'Khớp', tone: 'ok' };
  }
  if (diff < 0) {
    return { label: 'Thiếu', tone: 'bad' };
  }
  return { label: 'Dư', tone: 'warn' };
}

export type PurchaseOrderDetailTabPanelsProps = {
  activeTab: PurchaseOrderDetailTabId;
  po: PurchaseOrderApi;
  listRow: PurchaseOrderListRow | null;
  decimals: number;
  items: PurchaseOrderItemApi[];
  firstInbound: PurchaseOrderInboundApi | null;
};

export function PurchaseOrderDetailTabPanels({
  activeTab,
  po,
  listRow,
  decimals,
  items,
  firstInbound,
}: PurchaseOrderDetailTabPanelsProps) {
  const styles = useThemeStyleSheet(create_PurchaseOrderDetailTabPanels_styles);
  const palette = useAppColors();
  const canvas = useCanvasDetailStyles();

  const totals = useMemo(() => {
    let ordered = 0;
    let received = 0;
    for (const it of items) {
      ordered += lineOrderedQty(it);
      received += lineReceivedQty(it);
    }
    const diff = received - ordered;
    const pct = ordered > 0 ? (diff / ordered) * 100 : 0;
    const overall = compareStatusLabel(diff);
    let matched = 0;
    let missing = 0;
    let excess = 0;
    for (const it of items) {
      const o = lineOrderedQty(it);
      const r = lineReceivedQty(it);
      const d = r - o;
      if (d === 0) {
        matched += 1;
      } else if (d < 0) {
        missing += 1;
      } else {
        excess += 1;
      }
    }
    return { ordered, received, diff, pct, overall, matched, missing, excess };
  }, [items]);

  switch (activeTab) {
    case 'info':
      return (
        <>
          {listRow ? (
            <>
              <CanvasDetailMetricPair
                left={{
                  label: 'Số lượng đặt',
                  value: String(listRow.expectedQty),
                  icon: 'clipboard',
                }}
                right={{
                  label: 'Đã nhận',
                  value: String(listRow.receivedQty),
                  icon: 'download',
                }}
              />
              <CanvasDetailProgressCard
                title="TIẾN ĐỘ NHẬP KHO"
                items={[
                  {
                    label: 'Hoàn thành',
                    percent: listRow.progressPct,
                  },
                ]}
              />
            </>
          ) : null}

          <DetailCard title="Thông tin nhà cung cấp" icon="business">
            <DetailRow
              label="Nhà cung cấp"
              value={po.supplier?.name?.trim() || '—'}
            />
            <DetailRow
              label="Mã nhà cung cấp"
              value={po.supplier?.code?.trim() || '—'}
            />
          </DetailCard>

          <DetailCard title="Chi tiết đơn hàng" icon="clipboard">
            <DetailRow
              label="Kho hàng"
              value={po.warehouse?.name?.trim() || '—'}
            />
            <DetailRow
              label="Ngày dự kiến nhận"
              value={formatDateVi(po.expected_at ?? null)}
            />
            <DetailRow
              label="Mã vận đơn"
              value={po.tracking_number?.trim() || '—'}
            />
            <DetailRow
              label="Ngày tạo"
              value={formatDateTimeVi(po.created_at ?? null)}
            />
            <View style={styles.detailRow}>
              <Text style={styles.detailLab}>Đơn nhập kho</Text>
              <View style={styles.inboundCell}>
                {firstInbound?.order_number ? (
                  <Text style={styles.inboundNum}>
                    {firstInbound.order_number}
                  </Text>
                ) : (
                  <Text style={styles.detailVal}>-</Text>
                )}
                {firstInbound?.status ? (
                  <View style={styles.inboundPill}>
                    <Text style={styles.inboundPillTxt}>
                      {inboundStatusLabel(firstInbound.status)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </DetailCard>
        </>
      );

    case 'products':
      return (
        <View style={[canvas.screenPad, canvas.blockGap]}>
          <View style={canvas.sectionHeader}>
            <SystemIcon name="package" size={18} color={palette.teal} />
            <Text style={canvas.sectionTitle}>Danh sách sản phẩm</Text>
          </View>
          {items.length === 0 ? (
            <Text style={styles.emptyTxt}>Chưa có dòng sản phẩm.</Text>
          ) : (
            <View style={styles.prodList}>
              {items.map((it, idx) => {
                const thumb =
                  it.product?.thumbnail_url?.trim() ||
                  it.product?.image_url?.trim() ||
                  null;
                const qty = lineOrderedQty(it);
                const recv = lineReceivedQty(it);
                const remain = Math.max(0, qty - recv);
                const linePct =
                  qty > 0
                    ? Math.min(100, Math.round((recv / qty) * 100))
                    : recv > 0
                      ? 100
                      : 0;
                const lineTotal = formatMoneyFromApi(
                  it.total != null ? String(it.total) : null,
                  decimals,
                );
                const unitP = formatMoneyFromApi(
                  it.unit_price != null ? String(it.unit_price) : null,
                  decimals,
                );
                return (
                  <CanvasDetailLineItemCard
                    key={String(it.id ?? `${it.product_id}-${it.sku}-${idx}`)}
                    title={it.name ?? it.product?.name ?? '—'}
                    subtitle={`SKU: ${it.sku ?? it.product?.sku ?? '—'}`}
                    thumbnailUri={thumb}
                    progressPercent={linePct}
                    meta={`Đặt ${qty.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} · Đã nhận ${recv.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} · Còn ${remain.toLocaleString('vi-VN')} · Đơn giá ${unitP}`}
                    footer={`Thành tiền: ${lineTotal}`}
                  />
                );
              })}
            </View>
          )}
        </View>
      );

    case 'compare': {
      const {
        ordered,
        received,
        diff,
        pct,
        overall,
        matched,
        missing,
        excess,
      } = totals;
      const pctStr = `${pct.toFixed(1)}%`;
      return (
        <>
          <DetailCard title="Tổng quan so sánh" icon="compare">
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Số lượng đặt</Text>
                <Text style={styles.metricVal}>
                  {ordered.toLocaleString('vi-VN')}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Đã nhận</Text>
                <Text style={styles.metricVal}>
                  {received.toLocaleString('vi-VN')}
                </Text>
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Chênh lệch</Text>
                <Text
                  style={[
                    styles.metricVal,
                    overall.tone === 'bad' && styles.badTxt,
                    overall.tone === 'warn' && styles.warnTxt,
                  ]}
                >
                  {diff.toLocaleString('vi-VN')} ({pctStr})
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Trạng thái</Text>
                <View style={styles.mt6}>
                  <View
                    style={[
                      styles.statusPill,
                      overall.tone === 'ok' && styles.statusPillOk,
                      overall.tone === 'bad' && styles.statusPillBad,
                      overall.tone === 'warn' && styles.statusPillWarn,
                    ]}
                  >
                    <Text style={styles.statusPillTxt}>{overall.label}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeMuted}>Khớp: {matched}</Text>
              <Text style={styles.badgeBad}>Thiếu: {missing}</Text>
              <Text style={styles.badgeWarn}>Dư: {excess}</Text>
            </View>
          </DetailCard>

          <DetailCard title="So sánh chi tiết sản phẩm" icon="document">
            {items.length === 0 ? (
              <Text style={styles.emptyTxt}>Không có dòng để so sánh.</Text>
            ) : (
              items.map((it, idx) => {
                const o = lineOrderedQty(it);
                const r = lineReceivedQty(it);
                const d = r - o;
                const p = o > 0 ? (d / o) * 100 : 0;
                const st = compareStatusLabel(d);
                const sku = (it.sku ?? it.product?.sku ?? '—').trim() || '—';
                const name = (it.name ?? it.product?.name ?? '—').trim() || '—';
                return (
                  <View
                    key={String(it.id ?? `${sku}-${idx}`)}
                    style={[
                      styles.compareBlock,
                      idx > 0 && styles.compareBlockMt,
                    ]}
                  >
                    <DetailRow label="Mã SKU" value={sku} />
                    <DetailRow label="Tên sản phẩm" value={name} />
                    <DetailRow label="Số lượng đặt" value={String(o)} />
                    <DetailRow label="Đã nhận" value={String(r)} />
                    <DetailRow
                      label="Chênh lệch"
                      value={`${d} (${p.toFixed(1)}%)`}
                    />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLab}>Trạng thái</Text>
                      <View
                        style={[
                          styles.statusPillSm,
                          st.tone === 'ok' && styles.statusPillOk,
                          st.tone === 'bad' && styles.statusPillBad,
                          st.tone === 'warn' && styles.statusPillWarn,
                        ]}
                      >
                        <Text style={styles.statusPillTxt}>{st.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </DetailCard>

          <DetailCard title="Đơn nhập kho liên quan" icon="link">
            {(po.inbound_orders ?? []).length === 0 ? (
              <Text style={styles.emptyTxt}>
                Chưa có đơn nhập kho liên quan.
              </Text>
            ) : (
              (po.inbound_orders ?? []).map((ib, i) => (
                <View
                  key={String(ib.id ?? ib.order_number ?? i)}
                  style={[styles.inboundRow, i > 0 && styles.inboundRowMt]}
                >
                  <Text style={styles.inboundNum}>
                    {ib.order_number ?? '—'}
                  </Text>
                  <Text style={styles.inboundSub}>
                    {formatDateTimeVi(ib.created_at ?? null)}
                  </Text>
                  {ib.status ? (
                    <View style={styles.inboundPill}>
                      <Text style={styles.inboundPillTxt}>
                        {inboundStatusLabel(ib.status)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </DetailCard>
        </>
      );
    }

    case 'documents':
      return (
        <PurchaseOrderDetailDocumentsPanel attachments={po.attachments} />
      );

    case 'activity':
      return (
        <PurchaseOrderDetailActivityLogPanel
          purchaseOrderId={po.id}
          reloadSignal={po.updated_at ?? po.id}
        />
      );

    default:
      return null;
  }
}

function create_PurchaseOrderDetailTabPanels_styles(c: AppColorPalette) {
  return StyleSheet.create({
    metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    metric: { flex: 1, minWidth: 0 },
    metricLab: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 4,
    },
    metricVal: { fontSize: 16, fontWeight: '900', color: c.textPrimary },
    badTxt: { color: c.red },
    warnTxt: { color: c.orange },
    mt6: { marginTop: 6 },
    progBarBg: {
      height: 8,
      borderRadius: 4,
      backgroundColor: c.bgInput,
      overflow: 'hidden',
    },
    progBarBgSm: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.bgInput,
      overflow: 'hidden',
      marginTop: 6,
      marginBottom: 6,
    },
    progBarFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: c.teal,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    detailLab: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      maxWidth: '42%',
    },
    detailVal: {
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
      textAlign: 'right',
    },
    inboundCell: { flex: 1, alignItems: 'flex-end', gap: 6 },
    inboundNum: { fontSize: 13, fontWeight: '800', color: c.cyan },
    inboundPill: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: c.orangeBg,
      borderWidth: 1,
      borderColor: c.orange,
      alignSelf: 'flex-start',
    },
    inboundPillTxt: { fontSize: 11, fontWeight: '800', color: c.orange },
    inboundRow: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    inboundRowMt: { marginTop: 10 },
    inboundSub: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
    },
    prodList: { gap: 10 },
    emptyTxt: {
      textAlign: 'center',
      color: c.textMuted,
      fontWeight: '600',
      paddingVertical: 12,
    },
    prodCard: {
      flexDirection: 'row',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.borderMid,
      backgroundColor: c.bgInput,
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 8,
      backgroundColor: c.bgCard,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderMid,
    },
    thumbPh: { alignItems: 'center', justifyContent: 'center' },
    prodBody: { flex: 1, minWidth: 0 },
    prodName: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 4,
    },
    prodSku: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 4,
    },
    prodMeta: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
    remainEm: { fontWeight: '900', color: c.orange },
    prodTotal: {
      fontSize: 13,
      fontWeight: '900',
      color: c.teal,
      marginTop: 6,
    },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    badgeMuted: { fontSize: 12, fontWeight: '700', color: c.textMuted },
    badgeBad: { fontSize: 12, fontWeight: '800', color: c.red },
    badgeWarn: { fontSize: 12, fontWeight: '800', color: c.orange },
    statusPill: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    statusPillSm: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    statusPillOk: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    statusPillBad: {
      backgroundColor: c.redBg,
      borderColor: c.redBorder,
    },
    statusPillWarn: {
      backgroundColor: 'rgba(251,191,36,0.12)',
      borderColor: 'rgba(251,191,36,0.45)',
    },
    statusPillTxt: { fontSize: 11, fontWeight: '900', color: c.textPrimary },
    compareBlock: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      paddingTop: 8,
    },
    compareBlockMt: { marginTop: 8, paddingTop: 12 },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 16,
    },
    emptyTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: c.textPrimary },
    emptyHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 18,
    },
    timelineRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    timelineRowMt: { marginTop: 16 },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
      backgroundColor: c.teal,
    },
    timelineDotMuted: { backgroundColor: c.textMuted },
    timelineBody: { flex: 1, minWidth: 0 },
    timelineTitle: { fontSize: 14, fontWeight: '800', color: c.textPrimary },
    timelineMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
    },
  });
}
