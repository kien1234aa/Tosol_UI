import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';

import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { confirmDialog, toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  orderDetailTabsForAppRole,
} from '@features/auth/utils/roleNavPolicy';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import {
  createDetailQuickDockInScrollSectionStyles,
  detailScreenMainScrollContentTopPad,
  detailScreenScrollBottomInset,
  detailScreenTabPanelsPad,
} from '@shared/components/ui/detailScreenScrollDock';
import {
  detailScreenBody,
  detailScreenMainCol,
  detailScreenMainColumn,
  detailScreenRoot,
  detailScreenScrollFlex,
} from '@shared/components/ui/detailScreenLayout';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../components/SalesScreenHeader';
import {
  OrderStatusPill,
  PaymentStatusPill,
} from '../orders/components/OrderStatusPill';
import { mapApiOrderStatus, mapApiPaymentStatus } from '@mappers/sales/orderMappers';
import { resolvePaymentRefForSaleOrder } from './orderDetail/orderPaymentRef';
import { resolveInvoiceRefForSaleOrder } from '@services/finance/invoiceAPI';
import {
  cancelSaleOrder,
  cancelSaleOrderPacking,
  confirmSaleOrder,
  getSaleOrderDetail,
  markSaleOrderIssue,
  resolveSaleOrderIssue,
  saleOrderApiRef,
} from '@services/sales/orderAPI';
import type { SaleOrder } from '@services/sales/saleOrderApiTypes';
import type { OrderDetailTabId } from './orderDetail/orderDetailTypes';
import {
  formatMoneyFromApi,
  formatOrderDateVi,
} from './orderDetail/orderDetailFormatters';
import {
  OrderDetailOverviewSection,
  OrderDetailQuickDock,
} from './orderDetail/OrderDetailScrollFooter';
import { OrderDetailTabBar } from './orderDetail/OrderDetailTabBar';
import { OrderDetailTabPanels } from './orderDetail/OrderDetailTabPanels';

export type OrderDetailScreenProps = {
  orderRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Mở overlay chi tiết giao dịch thanh toán của đơn (Tài chính → Thanh toán). */
  onOpenPayment?: (paymentRef: string) => void;
  /** Mở overlay chi tiết hóa đơn của đơn (Tài chính → Hóa đơn). */
  onOpenInvoice?: (invoiceRef: string) => void;
};

export function OrderDetailScreen({
  orderRef,
  onOpenDrawer,
  onBack,
  onOpenPayment,
  onOpenInvoice,
}: OrderDetailScreenProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_OrderDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );

  const insets = useSafeAreaInsets();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const orderDetailTabs = useMemo(
    () => orderDetailTabsForAppRole(appRole),
    [appRole],
  );
  const [order, setOrder] = useState<SaleOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderDetailTabId>('info');

  useEffect(() => {
    setActiveTab(prev =>
      coerceDetailActiveTabId(prev, orderDetailTabs, 'info'),
    );
  }, [orderDetailTabs]);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [issueDraft, setIssueDraft] = useState('');
  const [markingIssue, setMarkingIssue] = useState(false);
  const [cancelPackingModalVisible, setCancelPackingModalVisible] =
    useState(false);
  const [cancelPackingDraft, setCancelPackingDraft] = useState('');
  const [cancellingPacking, setCancellingPacking] = useState(false);
  const [cancelOrderModalVisible, setCancelOrderModalVisible] = useState(false);
  const [cancelOrderDraft, setCancelOrderDraft] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [openingPayment, setOpeningPayment] = useState(false);
  const [openingInvoice, setOpeningInvoice] = useState(false);

  const actionOrderRef = useMemo(
    () => (order != null ? saleOrderApiRef(order) : orderRef),
    [order, orderRef],
  );

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getSaleOrderDetail(orderRef);
      setOrder(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('orders.errors.loadDetail');
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setOrder(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderRef, t, onBack]);

  useEffect(() => {
    setLoading(true);
    load(true).catch(() => {});
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().catch(() => {});
  }, [load]);

  const runResolveIssue = useCallback(async () => {
    try {
      await resolveSaleOrderIssue(actionOrderRef);
      await load();
      toast.success(t('orders.alert.resolveSuccess'));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('common.genericFailure'));
    }
  }, [actionOrderRef, load, t]);

  const runConfirmOrder = useCallback(async () => {
    try {
      await confirmSaleOrder(actionOrderRef);
      await load();
      toast.success(t('orders.alert.confirmSuccess'));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('common.genericFailure'));
    }
  }, [actionOrderRef, load, t]);

  const onQuickActionPress = useCallback(
    async (key: string) => {
      if (key === 'confirm') {
        const ok = await confirmDialog({
          title: t('orders.alert.confirmOrderTitle'),
          message: t('orders.alert.confirmOrderBody'),
          confirmText: t('common.confirm'),
        });
        if (ok) {
          runConfirmOrder().catch(() => {});
        }
        return;
      }
      if (key === 'issue') {
        setIssueDraft('');
        setIssueModalVisible(true);
        return;
      }
      if (key === 'resolve_issue') {
        const ok = await confirmDialog({
          title: t('orders.alert.resolveTitle'),
          message: t('orders.alert.resolveBody'),
          confirmText: t('common.confirm'),
        });
        if (ok) {
          runResolveIssue().catch(() => {});
        }
        return;
      }
      if (key === 'cancel_packing') {
        setCancelPackingDraft('');
        setCancelPackingModalVisible(true);
        return;
      }
      if (key === 'cancel_order') {
        setCancelOrderDraft('');
        setCancelOrderModalVisible(true);
        return;
      }
      if (key === 'payment') {
        if (!onOpenPayment) {
          toast.info(t('orders.alert.notImplemented'));
          return;
        }
        if (openingPayment) {
          return;
        }
        if (order == null) {
          toast.error(t('orders.errors.loadDetail'));
          return;
        }
        void (async () => {
          setOpeningPayment(true);
          try {
            const paymentRef = await resolvePaymentRefForSaleOrder(order);
            onOpenPayment(paymentRef);
          } catch (e: unknown) {
            toast.error(
              e instanceof Error
                ? e.message
                : t('orders.alert.paymentNotFound'),
            );
          } finally {
            setOpeningPayment(false);
          }
        })();
        return;
      }
      if (key === 'invoice') {
        if (!onOpenInvoice) {
          toast.info(t('orders.alert.notImplemented'));
          return;
        }
        if (openingInvoice) {
          return;
        }
        if (order == null) {
          toast.error(t('orders.errors.loadDetail'));
          return;
        }
        void (async () => {
          setOpeningInvoice(true);
          try {
            const invoiceRef = await resolveInvoiceRefForSaleOrder(order);
            onOpenInvoice(invoiceRef);
          } catch (e: unknown) {
            toast.error(
              e instanceof Error
                ? e.message
                : t('orders.alert.invoiceNotFound'),
            );
          } finally {
            setOpeningInvoice(false);
          }
        })();
        return;
      }
      toast.info(t('orders.alert.notImplemented'));
    },
    [
      runResolveIssue,
      runConfirmOrder,
      onOpenPayment,
      openingPayment,
      onOpenInvoice,
      openingInvoice,
      order,
      t,
    ],
  );

  const closeIssueModal = useCallback(() => {
    if (!markingIssue) {
      setIssueModalVisible(false);
    }
  }, [markingIssue]);

  const submitMarkIssue = useCallback(async () => {
    const text = issueDraft.trim();
    if (!text) {
      toast.warning(t('orders.alert.issueNeedDescription'));
      return;
    }
    setMarkingIssue(true);
    try {
      await markSaleOrderIssue(actionOrderRef, text);
      setIssueModalVisible(false);
      setIssueDraft('');
      await load();
      toast.success(t('orders.alert.issueSavedBody'));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('common.genericFailure'));
    } finally {
      setMarkingIssue(false);
    }
  }, [issueDraft, actionOrderRef, load, t]);

  const closeCancelPackingModal = useCallback(() => {
    if (!cancellingPacking) {
      setCancelPackingModalVisible(false);
    }
  }, [cancellingPacking]);

  const submitCancelPacking = useCallback(async () => {
    const text = cancelPackingDraft.trim();
    if (!text) {
      toast.warning(t('orders.alert.cancelPackingNeedReason'));
      return;
    }
    setCancellingPacking(true);
    try {
      await cancelSaleOrderPacking(actionOrderRef, text);
      setCancelPackingModalVisible(false);
      setCancelPackingDraft('');
      await load();
      toast.success(t('orders.alert.cancelPackingSuccess'));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('common.genericFailure'));
    } finally {
      setCancellingPacking(false);
    }
  }, [cancelPackingDraft, actionOrderRef, load, t]);

  const closeCancelOrderModal = useCallback(() => {
    if (!cancellingOrder) {
      setCancelOrderModalVisible(false);
    }
  }, [cancellingOrder]);

  const submitCancelOrder = useCallback(async () => {
    const text = cancelOrderDraft.trim();
    if (!text) {
      toast.warning(t('orders.alert.cancelOrderNeedReason'));
      return;
    }
    setCancellingOrder(true);
    try {
      await cancelSaleOrder(actionOrderRef, text);
      setCancelOrderModalVisible(false);
      setCancelOrderDraft('');
      await load();
      toast.success(t('orders.alert.cancelOrderSuccess'));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('common.genericFailure'));
    } finally {
      setCancellingOrder(false);
    }
  }, [cancelOrderDraft, actionOrderRef, load, t]);

  const decimals =
    order?.currency?.decimal_places ??
    order?.shop?.currency?.decimal_places ??
    0;
  const statusPill = order ? mapApiOrderStatus(order.status) : 'pending';
  const paymentPill = order
    ? mapApiPaymentStatus(order.payment_status)
    : 'pending_payment';
  const items = useMemo(() => order?.items ?? [], [order]);
  const itemCount = items.length;

  const itemsQtySum = useMemo(() => {
    return items.reduce((s, it) => {
      const q = Number(String(it.quantity ?? '0').replace(',', '.'));
      return s + (Number.isFinite(q) ? q : 0);
    }, 0);
  }, [items]);

  const paidFromApi =
    order?.paid_amount != null && Number.isFinite(order.paid_amount)
      ? order.paid_amount
      : order?.total_paid != null && Number.isFinite(order.total_paid)
      ? order.total_paid
      : 0;
  const remainingFromApi =
    order?.remaining_amount != null && Number.isFinite(order.remaining_amount)
      ? order.remaining_amount
      : null;
  const totalNum = order ? Number(order.total) : NaN;
  const remainingComputed =
    remainingFromApi != null && Number.isFinite(remainingFromApi)
      ? remainingFromApi
      : Number.isFinite(totalNum) && Number.isFinite(paidFromApi)
      ? Math.max(0, Math.round(totalNum - paidFromApi))
      : NaN;

  const historyMilestones = useMemo(() => {
    if (!order) {
      return [];
    }
    return [
      {
        key: 'created',
        labelKey: 'orders.historyMilestone.created',
        at: order.created_at,
      },
      {
        key: 'confirmed',
        labelKey: 'orders.historyMilestone.confirmed',
        at: order.confirmed_at ?? null,
      },
      {
        key: 'packed',
        labelKey: 'orders.historyMilestone.packed',
        at: order.packed_at ?? null,
      },
      {
        key: 'ready',
        labelKey: 'orders.historyMilestone.ready',
        at: ['ready_to_ship', 'shipped', 'delivered'].includes(order.status)
          ? order.packed_at ?? order.updated_at
          : null,
      },
      {
        key: 'shipped',
        labelKey: 'orders.historyMilestone.shipped',
        at: ['shipped', 'delivered'].includes(order.status)
          ? order.shipped_at ?? null
          : null,
      },
      {
        key: 'delivered',
        labelKey: 'orders.historyMilestone.delivered',
        at: order.delivered_at ?? null,
      },
    ];
  }, [order]);

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
      />
    ),
    [refreshing, onRefresh, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <View style={detailScreenMainCol}>
        <Text style={styles.breadcrumb} numberOfLines={2}>
          {t('orders.screen.breadcrumb')}
          {order?.shop?.name ? ` · ${order.shop.name}` : ''}
          {order?.order_number ? ` · ${order.order_number}` : ''}
        </Text>

        {loading && !order ? (
          <DetailScreenSkeleton />
        ) : error ? (
          <ScrollView
            style={detailScreenScrollFlex}
            contentContainerStyle={[ canvasListScrollContent(),
              { paddingBottom: insets.bottom + 24 },
            ]}
            nestedScrollEnabled
          >
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{error}</Text>
              <Pressable
                onPress={() => load(true).catch(() => {})}
                style={styles.retryBtn}
              >
                <Text style={styles.retryTxt}>{t('common.retry')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : order ? (
          <View style={detailScreenBody}>
            <View style={detailScreenMainColumn}>
              {/*
                Một ScrollView dọc cho toàn bộ nội dung (hero → tổng quan → tab → panel).
                Tránh tình huống hero + tổng quan cố định chiếm hết chiều cao khiến vùng tab co về 0 và không lướt được.
              */}
              <DetailScreenTabScroll
                style={detailScreenScrollFlex}
                contentContainerStyle={[
                  detailScreenMainScrollContentTopPad,
                  {
                    paddingBottom: detailScreenScrollBottomInset(insets.bottom),
                  },
                ]}
                refreshControl={memoizedRefreshControl}
              >
                <CanvasDetailHeroCard
                  title={order.order_number?.trim() || t('common.dash')}
                  subtitle={order.shop?.name?.trim() || undefined}
                  healthLabel={t('orders.overviewCustomer')}
                  healthValue={
                    order.customer?.name?.trim() || t('common.dash')
                  }
                  statusSlot={
                    <View style={styles.pillRow}>
                      <OrderStatusPill status={statusPill} />
                      <PaymentStatusPill status={paymentPill} />
                    </View>
                  }
                />

                {order.has_issue ? (
                  <View style={styles.issueBanner}>
                    <SystemIcon
                      name="warning"
                      size={20}
                      color={palette.orange}
                    />
                    <Text style={styles.issueBannerTxt}>
                      {t('orders.ui.issueFlagBanner')}
                    </Text>
                  </View>
                ) : null}

                {order.status === 'packing' ? (
                  <View style={styles.infoBanner}>
                    <SystemIcon name="info" size={18} color={palette.blue} />
                    <Text style={styles.infoBannerTxt}>
                      {t('orders.ui.packingBanner')}
                    </Text>
                  </View>
                ) : null}

                <OrderDetailOverviewSection order={order} decimals={decimals} />

                <OrderDetailTabBar
                  tabs={orderDetailTabs}
                  activeTab={activeTab}
                  itemCount={itemCount}
                  onSelectTab={setActiveTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <OrderDetailTabPanels
                    activeTab={activeTab}
                    order={order}
                    decimals={decimals}
                    statusPill={statusPill}
                    paymentPill={paymentPill}
                    items={items}
                    itemCount={itemCount}
                    itemsQtySum={itemsQtySum}
                    paidFromApi={paidFromApi}
                    remainingComputed={remainingComputed}
                    historyMilestones={historyMilestones}
                  />
                </View>

                <View style={dockInScroll.section}>
                  <OrderDetailQuickDock
                    order={order}
                    onQuickActionPress={onQuickActionPress}
                  />
                </View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>

      <Modal
        visible={issueModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeIssueModal}
      >
        <KeyboardAvoidingView style={styles.issueKb} behavior="padding">
          <Pressable style={styles.issueOverlay} onPress={closeIssueModal}>
            <Pressable
              style={styles.issueCard}
              onPress={e => e.stopPropagation()}
            >
              <Text style={styles.issueTitle}>
                {t('orders.ui.markIssueTitle')}
              </Text>
              <Text style={styles.issueHint}>
                {t('orders.ui.markIssueHint')}
              </Text>
              <TextInput
                value={issueDraft}
                onChangeText={setIssueDraft}
                placeholder={t('orders.ui.markIssuePlaceholder')}
                placeholderTextColor={palette.textMuted}
                multiline
                editable={!markingIssue}
                style={styles.issueInput}
                textAlignVertical="top"
              />
              <View style={styles.issueActions}>
                <Pressable
                  onPress={closeIssueModal}
                  disabled={markingIssue}
                  style={({ pressed }) => [
                    styles.issueBtn,
                    styles.issueBtnGhost,
                    pressed && !markingIssue && styles.issueBtnPressed,
                    markingIssue && styles.issueBtnDisabled,
                  ]}
                >
                  <Text style={styles.issueBtnGhostTxt}>
                    {t('common.cancel')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    submitMarkIssue().catch(() => {});
                  }}
                  disabled={markingIssue}
                  style={({ pressed }) => [
                    styles.issueBtn,
                    styles.issueBtnPrimary,
                    pressed && !markingIssue && styles.issueBtnPressed,
                    markingIssue && styles.issueBtnDisabled,
                  ]}
                >
                  {markingIssue ? (
                    <ActivityIndicator size="small" color="#0d1b2a" />
                  ) : (
                    <Text style={styles.issueBtnPrimaryTxt}>
                      {t('orders.ui.send')}
                    </Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={cancelPackingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCancelPackingModal}
      >
        <KeyboardAvoidingView style={styles.issueKb} behavior="padding">
          <Pressable
            style={styles.issueOverlay}
            onPress={closeCancelPackingModal}
          >
            <Pressable
              style={styles.issueCard}
              onPress={e => e.stopPropagation()}
            >
              <Text style={styles.issueTitle}>
                {t('orders.ui.cancelPackingTitle')}
              </Text>
              <Text style={styles.issueHint}>
                {t('orders.ui.cancelPackingHint')}
              </Text>
              <TextInput
                value={cancelPackingDraft}
                onChangeText={setCancelPackingDraft}
                placeholder={t('orders.ui.cancelPackingPlaceholder')}
                placeholderTextColor={palette.textMuted}
                multiline
                editable={!cancellingPacking}
                style={styles.issueInput}
                textAlignVertical="top"
              />
              <View style={styles.issueActions}>
                <Pressable
                  onPress={closeCancelPackingModal}
                  disabled={cancellingPacking}
                  style={({ pressed }) => [
                    styles.issueBtn,
                    styles.issueBtnGhost,
                    pressed && !cancellingPacking && styles.issueBtnPressed,
                    cancellingPacking && styles.issueBtnDisabled,
                  ]}
                >
                  <Text style={styles.issueBtnGhostTxt}>
                    {t('common.cancel')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    submitCancelPacking().catch(() => {});
                  }}
                  disabled={cancellingPacking}
                  style={({ pressed }) => [
                    styles.issueBtn,
                    styles.issueBtnPrimary,
                    pressed && !cancellingPacking && styles.issueBtnPressed,
                    cancellingPacking && styles.issueBtnDisabled,
                  ]}
                >
                  {cancellingPacking ? (
                    <ActivityIndicator size="small" color="#0d1b2a" />
                  ) : (
                    <Text style={styles.issueBtnPrimaryTxt}>
                      {t('orders.ui.send')}
                    </Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={cancelOrderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCancelOrderModal}
      >
        <KeyboardAvoidingView style={styles.issueKb} behavior="padding">
          <Pressable
            style={styles.issueOverlay}
            onPress={closeCancelOrderModal}
          >
            <Pressable
              style={styles.issueCard}
              onPress={e => e.stopPropagation()}
            >
              <Text style={styles.issueTitle}>
                {t('orders.ui.cancelOrderTitle')}
              </Text>
              <Text style={styles.issueHint}>
                {t('orders.ui.cancelOrderHint')}
              </Text>
              <TextInput
                value={cancelOrderDraft}
                onChangeText={setCancelOrderDraft}
                placeholder={t('orders.ui.cancelOrderPlaceholder')}
                placeholderTextColor={palette.textMuted}
                multiline
                editable={!cancellingOrder}
                style={styles.issueInput}
                textAlignVertical="top"
              />
              <View style={styles.issueActions}>
                <Pressable
                  onPress={closeCancelOrderModal}
                  disabled={cancellingOrder}
                  style={({ pressed }) => [
                    styles.issueBtn,
                    styles.issueBtnGhost,
                    pressed && !cancellingOrder && styles.issueBtnPressed,
                    cancellingOrder && styles.issueBtnDisabled,
                  ]}
                >
                  <Text style={styles.issueBtnGhostTxt}>
                    {t('orders.ui.close')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    submitCancelOrder().catch(() => {});
                  }}
                  disabled={cancellingOrder}
                  style={({ pressed }) => [
                    styles.issueBtn,
                    styles.issueBtnPrimary,
                    pressed && !cancellingOrder && styles.issueBtnPressed,
                    cancellingOrder && styles.issueBtnDisabled,
                  ]}
                >
                  {cancellingOrder ? (
                    <ActivityIndicator size="small" color="#0d1b2a" />
                  ) : (
                    <Text style={styles.issueBtnPrimaryTxt}>
                      {t('orders.ui.cancelOrderButton')}
                    </Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function create_OrderDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      marginTop: 4,
      marginBottom: 8,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    breadcrumb: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 4,
      lineHeight: 18,
      paddingHorizontal: 16,
    },

    errBox: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 14, fontWeight: '600', color: c.red, marginBottom: 12 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.cyan },
    hero: {
      marginHorizontal: 16,
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
      marginBottom: 8,
    },
    heroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    orderNo: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
    },
    heroAmount: {
      marginTop: 4,
      fontSize: 22,
      fontWeight: '800',
      color: c.green,
      letterSpacing: -0.3,
    },
    heroAmountLab: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 10,
    },
    metaItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      maxWidth: '100%',
    },
    metaItem: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      flexShrink: 1,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    issueBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 10,
      backgroundColor: 'rgba(251,146,60,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(251,146,60,0.4)',
    },
    issueBannerTxt: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: c.orange,
      lineHeight: 18,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 10,
      backgroundColor: c.blueBg,
      borderWidth: 1,
      borderColor: 'rgba(96,165,250,0.35)',
    },
    infoBannerTxt: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 18,
    },
    issueKb: { flex: 1 },
    issueOverlay: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    issueCard: {
      backgroundColor: c.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
    },
    issueTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 6,
    },
    issueHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: 12,
      lineHeight: 18,
    },
    issueInput: {
      minHeight: 100,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      color: c.textPrimary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      marginBottom: 16,
    },
    issueActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    issueBtn: {
      minWidth: 96,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    issueBtnGhost: {
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    issueBtnGhostTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textSecondary,
    },
    issueBtnPrimary: { backgroundColor: c.cyan },
    issueBtnPrimaryTxt: { fontSize: 15, fontWeight: '800', color: '#0d1b2a' },
    issueBtnPressed: { opacity: 0.88 },
    issueBtnDisabled: { opacity: 0.55 },
  });
}
