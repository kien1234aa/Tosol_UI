import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import {
  OrderStatusPill,
  PaymentStatusPill,
} from '../../orders/components/OrderStatusPill';
import type {
  OrderPaymentStatus,
  OrderRowStatus,
} from '../../orders/orderTypes';
import type {
  SaleOrder,
  SaleOrderItem,
} from '@services/sales/saleOrderApiTypes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import {
  formatDateTimeVi,
  formatMoneyFromApi,
  formatMoneyVndNumber,
  orderStatusStepIndex,
  ORDER_DETAIL_PROGRESS_STEP_KEYS,
  paymentMethodLabel,
  shipPayerLabel,
} from './orderDetailFormatters';
import {
  DetailCard,
  DetailRow,
  HorizontalOrderStepper,
} from './OrderDetailPrimitives';
import type { OrderDetailTabId } from './orderDetailTypes';
import { OrderDetailActivityLogPanel } from './OrderDetailActivityLogPanel';

export type HistoryMilestone = {
  key: string;
  labelKey: string;
  at: string | null | undefined;
};

export type OrderDetailTabPanelsProps = {
  activeTab: OrderDetailTabId;
  order: SaleOrder;
  decimals: number;
  statusPill: OrderRowStatus;
  paymentPill: OrderPaymentStatus;
  items: SaleOrderItem[];
  itemCount: number;
  itemsQtySum: number;
  paidFromApi: number;
  remainingComputed: number;
  historyMilestones: HistoryMilestone[];
};

function OrderDetailTabPanelsInner({
  activeTab,
  order,
  decimals,
  statusPill,
  paymentPill,
  items,
  itemCount,
  itemsQtySum,
  paidFromApi,
  remainingComputed,
  historyMilestones,
}: OrderDetailTabPanelsProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createOrderDetailTabPanelsStyles);
  return useMemo(() => {
    const shipFee =
      order.shipping_fee != null && order.shipping_fee !== ''
        ? formatMoneyFromApi(order.shipping_fee, decimals)
        : order.shipment?.shipping_fee
        ? formatMoneyFromApi(order.shipment.shipping_fee, decimals)
        : t('common.dash');

    switch (activeTab) {
      case 'info':
        return (
          <>
            <DetailCard
              title={t('orders.detail.orderDetailTitle')}
              icon="clipboard"
            >
              <DetailRow
                label={t('orders.detail.orderCode')}
                value={order.order_number}
              />
              <View style={styles.grid2}>
                <View style={styles.gridCell}>
                  <Text style={styles.detailLab}>
                    {t('orders.detail.status')}
                  </Text>
                  <View style={styles.mt6}>
                    <OrderStatusPill status={statusPill} />
                  </View>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.detailLab}>
                    {t('orders.detail.payment')}
                  </Text>
                  <View style={styles.mt6}>
                    <PaymentStatusPill status={paymentPill} />
                  </View>
                </View>
              </View>
              <DetailRow
                label={t('orders.detail.paymentMethod')}
                value={paymentMethodLabel(order.payment_method)}
              />
            </DetailCard>

            <DetailCard
              title={t('orders.detail.channelWarehouseTitle')}
              icon="store"
            >
              <DetailRow
                label={t('orders.detail.shop')}
                value={order.shop?.name ?? t('common.dash')}
              />
              <DetailRow
                label={t('orders.detail.seller')}
                value={
                  order.seller
                    ? [order.seller.name, order.seller.code]
                        .filter(Boolean)
                        .join(' ')
                    : t('common.dash')
                }
              />
              <DetailRow
                label={t('orders.detail.packingWarehouse')}
                value={order.packing_warehouse?.name ?? t('common.dash')}
              />
              <DetailRow
                label={t('orders.detail.shippingWarehouse')}
                value={order.shipping_warehouse?.name ?? t('common.dash')}
              />
            </DetailCard>

            <DetailCard
              title={t('orders.detail.shippingInfoTitle')}
              icon="truck"
            >
              <DetailRow
                label={t('orders.detail.shipPayer')}
                value={shipPayerLabel(order.shipping_payer)}
              />
              <DetailRow
                label={t('orders.detail.shippingFee')}
                value={shipFee}
              />
              <DetailRow
                label={t('orders.detail.collectCod')}
                value={
                  order.collect_cod === true
                    ? t('common.yes')
                    : order.collect_cod === false
                    ? t('common.no')
                    : t('common.dash')
                }
              />
            </DetailCard>

            <DetailCard
              title={t('orders.detail.relatedOrdersTitle')}
              icon="link"
            >
              <DetailRow
                label={t('orders.detail.packingOrder')}
                value={order.packing_order?.order_number ?? t('common.dash')}
              />
              <DetailRow
                label={t('orders.detail.outboundOrder')}
                value={
                  order.outbound_orders?.[0]?.order_number ?? t('common.dash')
                }
              />
            </DetailCard>
          </>
        );

      case 'products': {
        const sub = order.subtotal ?? order.items_total;
        return (
          <>
            <DetailCard
              title={t('orders.detail.productsOverviewTitle')}
              icon="chart"
            >
              <View style={styles.overview3}>
                <View style={styles.ovCard}>
                  <View style={styles.ovIcoSlot}>
                    <SystemIcon
                      name="package"
                      size={22}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={styles.ovVal}>{itemCount}</Text>
                  <Text style={styles.ovLab}>
                    {t('orders.detail.totalProducts')}
                  </Text>
                </View>
                <View style={styles.ovCard}>
                  <View style={styles.ovIcoSlot}>
                    <SystemIcon
                      name="grid"
                      size={22}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={styles.ovVal}>
                    {itemsQtySum.toLocaleString('vi-VN', {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text style={styles.ovLab}>
                    {t('orders.detail.totalQty')}
                  </Text>
                </View>
                <View style={styles.ovCard}>
                  <View style={styles.ovIcoSlot}>
                    <SystemIcon
                      name="document"
                      size={22}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={[styles.ovVal, styles.ovValMoney]}>
                    {sub != null && sub !== ''
                      ? formatMoneyFromApi(sub, decimals)
                      : formatMoneyFromApi(order.total, decimals)}
                  </Text>
                  <Text style={styles.ovLab}>
                    {t('orders.detail.itemsTotal')}
                  </Text>
                </View>
              </View>
            </DetailCard>

            <DetailCard
              title={t('orders.detail.productListTitle')}
              icon="clipboard"
            >
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.thNum]}>
                  {t('orders.detail.colHash')}
                </Text>
                <Text style={[styles.th, styles.thName]}>
                  {t('orders.detail.colProduct')}
                </Text>
                <Text style={[styles.th, styles.thN]}>
                  {t('orders.detail.colQty')}
                </Text>
                <Text style={[styles.th, styles.thN]}>
                  {t('orders.detail.colUnitPrice')}
                </Text>
              </View>
              {items.length === 0 ? (
                <Text style={styles.muted}>
                  {t('orders.detail.noProductLines')}
                </Text>
              ) : (
                items.map((it: SaleOrderItem, idx: number) => {
                  const thumb =
                    it.product?.thumbnail_url ?? it.product?.image_url ?? null;
                  return (
                    <View
                      key={it.id}
                      style={[styles.tr, idx % 2 === 1 ? styles.trAlt : null]}
                    >
                      <Text style={[styles.td, styles.thNum]}>{idx + 1}</Text>
                      <View style={[styles.thName, styles.prodCell]}>
                        {thumb ? (
                          <Image source={{ uri: thumb }} style={styles.thumb} />
                        ) : (
                          <View style={styles.thumbPh} />
                        )}
                        <View style={styles.prodTxtCol}>
                          <Text style={styles.tdName} numberOfLines={2}>
                            {it.name}
                          </Text>
                          {it.sku ? (
                            <Text style={styles.tdSku} numberOfLines={1}>
                              {it.sku}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Text style={[styles.td, styles.thN]}>
                        {it.quantity != null
                          ? String(it.quantity)
                          : t('common.dash')}
                      </Text>
                      <Text style={[styles.td, styles.thN]}>
                        {it.unit_price != null
                          ? formatMoneyFromApi(it.unit_price, decimals)
                          : t('common.dash')}
                      </Text>
                    </View>
                  );
                })
              )}
            </DetailCard>

            <OrderDetailActivityLogPanel
              orderId={order.id}
              reloadSignal={order.updated_at ?? order.id}
            />
          </>
        );
      }

      case 'payment':
        return (
          <>
            <DetailCard
              title={t('orders.detail.paymentOverviewTitle')}
              icon="card"
            >
              <View style={styles.payRow}>
                <View style={styles.payStat}>
                  <Text style={styles.payStatLab}>
                    {t('orders.detail.totalAmount')}
                  </Text>
                  <Text style={styles.payStatVal}>
                    {formatMoneyFromApi(order.total, decimals)}
                  </Text>
                </View>
                <View style={styles.payStat}>
                  <Text style={styles.payStatLab}>
                    {t('orders.detail.paid')}
                  </Text>
                  <Text style={[styles.payStatVal, styles.payStatGreen]}>
                    {formatMoneyVndNumber(paidFromApi, decimals)}
                  </Text>
                </View>
                <View style={styles.payStat}>
                  <Text style={styles.payStatLab}>
                    {t('orders.detail.remaining')}
                  </Text>
                  <Text style={[styles.payStatVal, styles.payStatOrange]}>
                    {Number.isFinite(remainingComputed)
                      ? formatMoneyVndNumber(remainingComputed, decimals)
                      : t('common.dash')}
                  </Text>
                </View>
              </View>
              <Text style={styles.hintMuted}>
                {t('orders.detail.paymentApiHint')}
              </Text>
            </DetailCard>

            <DetailCard
              title={t('orders.detail.paymentHistoryTitle')}
              icon="list"
            >
              {(order.payments?.length ?? 0) === 0 ? (
                <View style={styles.emptyPay}>
                  <View style={styles.emptyPayIconSlot}>
                    <SystemIcon
                      name="card"
                      size={36}
                      color={palette.textMuted}
                    />
                  </View>
                  <Text style={styles.emptyPayTit}>
                    {t('orders.detail.noPaymentsTitle')}
                  </Text>
                  <Text style={styles.emptyPaySub}>
                    {t('orders.detail.noPaymentsSub')}
                  </Text>
                </View>
              ) : (
                (order.payments ?? []).map((p, i) => (
                  <DetailRow
                    key={p.id ?? i}
                    label={String(p.payment_method ?? t('common.dash'))}
                    value={formatMoneyFromApi(p.amount ?? '0', decimals)}
                  />
                ))
              )}
            </DetailCard>
          </>
        );

      case 'shipping':
        return (
          <>
            <DetailCard title={t('orders.detail.shippingTitle')} icon="truck">
              <DetailRow
                label={t('orders.detail.trackingNumber')}
                value={
                  order.shipment?.tracking_number?.trim() || t('common.dash')
                }
              />
              <DetailRow
                label={t('orders.detail.carrier')}
                value={
                  order.shipment?.shipping_partner_seller?.shipping_partner
                    ?.name ?? t('common.dash')
                }
              />
              <DetailRow
                label={t('orders.detail.carrierFeeShort')}
                value={shipFee}
              />
              <DetailRow
                label={t('orders.detail.weight')}
                value={
                  order.shipment?.weight != null && order.shipment.weight !== ''
                    ? `${order.shipment.weight} kg`
                    : t('common.dash')
                }
              />
              <DetailRow
                label={t('orders.detail.carrierStatus')}
                value={order.shipment?.status ?? t('common.dash')}
              />
            </DetailCard>

            <DetailCard title={t('orders.detail.recipientTitle')} icon="person">
              <DetailRow
                label={t('orders.detail.fullName')}
                value={
                  order.shipment?.recipient_name ??
                  order.customer?.name ??
                  t('common.dash')
                }
              />
              <DetailRow
                label={t('orders.detail.phoneShort')}
                value={
                  order.shipment?.recipient_phone ??
                  order.customer?.phone ??
                  t('common.dash')
                }
              />
              <DetailRow
                label={t('orders.detail.address')}
                value={
                  order.shipment?.recipient_address
                    ? [
                        order.shipment.recipient_address,
                        order.shipment.recipient_ward,
                        order.shipment.recipient_district,
                        order.shipment.recipient_province,
                      ]
                        .filter(x => x != null && String(x).trim() !== '')
                        .join(', ')
                    : order.customer?.full_address?.trim() ||
                      order.customer?.address?.trim() ||
                      t('common.dash')
                }
              />
            </DetailCard>

            <DetailCard
              title={t('orders.detail.deliveryProgressTitle')}
              icon="activity"
            >
              <Text style={styles.hintMuted}>
                {t('orders.detail.deliveryProgressHint')}
              </Text>
            </DetailCard>
          </>
        );

      case 'history': {
        const stepIdx = orderStatusStepIndex(order.status);
        const stepCount = ORDER_DETAIL_PROGRESS_STEP_KEYS.length;
        const pct =
          stepIdx < 0 ? 0 : Math.round(((stepIdx + 1) / stepCount) * 100);
        return (
          <>
            <DetailCard
              title={t('orders.detail.currentStatusTitle')}
              icon="info"
            >
              <View style={styles.histHead}>
                <OrderStatusPill status={statusPill} />
                <Text style={styles.histPct}>{pct}%</Text>
              </View>
              <Text style={styles.histDesc}>
                {stepIdx < 0
                  ? t('orders.history.progressUnknown')
                  : t('orders.history.progressMeta', {
                      current: stepIdx + 1,
                      total: stepCount,
                    })}
              </Text>
              <View style={styles.progBarBg}>
                <View style={[styles.progBarFill, { width: `${pct}%` }]} />
              </View>
            </DetailCard>

            <DetailCard
              title={t('orders.detail.historyTitle')}
              icon="analytics"
            >
              <HorizontalOrderStepper order={order} compact />
            </DetailCard>

            <DetailCard
              title={t('orders.detail.milestonesTitle')}
              icon="calendar"
            >
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.thEvt]}>
                  {t('orders.detail.eventCol')}
                </Text>
                <Text style={[styles.th, styles.thDate]}>
                  {t('orders.detail.dateCol')}
                </Text>
              </View>
              {historyMilestones.map((m, idx) => (
                <View
                  key={m.key}
                  style={[styles.tr, idx % 2 === 1 ? styles.trAlt : null]}
                >
                  <Text style={[styles.td, styles.thEvt]}>{t(m.labelKey)}</Text>
                  <Text style={[styles.td, styles.thDate]}>
                    {m.at ? formatDateTimeVi(m.at) : t('common.dash')}
                  </Text>
                </View>
              ))}
            </DetailCard>
          </>
        );
      }

      case 'activity':
        return (
          <OrderDetailActivityLogPanel
            orderId={order.id}
            reloadSignal={order.updated_at ?? order.id}
          />
        );

      default:
        return null;
    }
  }, [
    activeTab,
    order,
    decimals,
    statusPill,
    paymentPill,
    items,
    itemCount,
    itemsQtySum,
    paidFromApi,
    remainingComputed,
    historyMilestones,
    styles,
    palette,
    t,
  ]);
}

export const OrderDetailTabPanels = memo(OrderDetailTabPanelsInner);

function createOrderDetailTabPanelsStyles(c: AppColorPalette) {
  return StyleSheet.create({
    grid2: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    gridCell: { flex: 1, minWidth: 0 },
    detailLab: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      maxWidth: '44%',
    },
    mt6: { marginTop: 6 },
    muted: { fontSize: 13, color: c.textMuted, fontWeight: '600' },
    hintMuted: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: '600',
      lineHeight: 17,
      marginTop: 8,
    },
    mt10: { marginTop: 10 },
    overview3: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    ovCard: {
      flex: 1,
      minWidth: 100,
      padding: 12,
      borderRadius: 10,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
    },
    ovIcoSlot: { marginBottom: 6, alignItems: 'center' },
    ovVal: { fontSize: 16, fontWeight: '800', color: c.textPrimary },
    ovValMoney: { color: c.green },
    ovLab: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
    tableHead: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: 8,
      marginBottom: 4,
    },
    th: {
      fontSize: 10,
      fontWeight: '800',
      color: c.textMuted,
    },
    thNum: { width: 28, textAlign: 'center' },
    thName: { flex: 1, minWidth: 0 },
    thN: { width: 76, textAlign: 'right' },
    thEvt: { flex: 1.2 },
    thDate: { flex: 1, textAlign: 'right' },
    tr: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    trAlt: { backgroundColor: 'rgba(255,255,255,0.03)' },
    td: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
    prodCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    thumb: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: c.bgButton,
    },
    thumbPh: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    prodTxtCol: { flex: 1, minWidth: 0 },
    tdName: { fontSize: 13, fontWeight: '700', color: c.textPrimary },
    tdSku: { fontSize: 11, color: c.textMuted, marginTop: 2 },
    payRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    payStat: {
      flex: 1,
      minWidth: 100,
      padding: 10,
      borderRadius: 10,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
    },
    payStatLab: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 4,
    },
    payStatVal: { fontSize: 15, fontWeight: '800', color: c.textPrimary },
    payStatGreen: { color: c.green },
    payStatOrange: { color: c.orange },
    emptyPay: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    emptyPayIconSlot: { marginBottom: 8, opacity: 0.45, alignItems: 'center' },
    emptyPayTit: { fontSize: 15, fontWeight: '800', color: c.textSecondary },
    emptyPaySub: {
      fontSize: 12,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 18,
      paddingHorizontal: 8,
    },
    histHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    histPct: { fontSize: 16, fontWeight: '800', color: c.tealLight },
    histDesc: { fontSize: 12, color: c.textMuted, marginBottom: 10 },
    progBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    progBarFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.teal,
    },
  });
}
