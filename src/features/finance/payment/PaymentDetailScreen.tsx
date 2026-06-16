import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { quickActionPaint } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import {
  detailScreenBody,
  detailScreenMainCol,
  detailScreenMainColumn,
  detailScreenRoot,
  detailScreenScrollFlex,
} from '@shared/components/ui/detailScreenLayout';
import {
  createDetailQuickDockInScrollSectionStyles,
  detailScreenMainScrollContentTopPad,
  detailScreenScrollBottomInset,
} from '@shared/components/ui/detailScreenScrollDock';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  DetailCard,
  DetailRow,
} from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  formatDateTimeVi,
  formatDateVi,
  paymentMethodLabel,
} from '../../sales/screens/orderDetail/orderDetailFormatters';
import {
  getPaymentDetail,
  PAYMENT_DETAIL_ATTACHMENTS_INCLUDE,
  PAYMENT_DETAIL_INCLUDE,
  uploadPaymentAttachment,
} from '@services/finance/paymentAPI';
import { paymentAttachmentToRow } from '@mappers/finance/paymentAttachmentMappers';
import type { PaymentDetailDataApi } from '@services/finance/paymentApiTypes';
import {
  apiPaymentListStatusToRowStatus,
  parsePaymentAmount,
  paymentCurrencySymbol,
  paymentRowStatusLabel,
  pickSaleOrder,
} from '@mappers/finance/paymentListMappers';
import type {
  PaymentListRowKind,
  PaymentListRowStatus,
} from './paymentListTypes';

export type PaymentDetailScreenProps = {
  paymentRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
  onOpenOrder?: (orderNumber: string) => void;
};

function fmtMoney(
  raw: number | string | null | undefined,
  sym: string,
): string | null {
  const n = parsePaymentAmount(raw);
  if (!Number.isFinite(n)) {
    return null;
  }
  return `${Math.round(n).toLocaleString('vi-VN')}${sym}`;
}

function kindFromType(type: string | null | undefined): PaymentListRowKind {
  const raw = (type ?? '').trim().toLowerCase();
  if (raw === 'refund' || raw.includes('refund')) {
    return 'refund';
  }
  if (!raw || raw === 'payment') {
    return 'payment';
  }
  return 'unknown';
}

function orderPaymentStatusLabel(raw: string | null | undefined): string | null {
  const t = (raw ?? '').trim().toLowerCase();
  if (t === 'paid') {
    return 'Đã thanh toán';
  }
  if (t === 'pending' || t === 'unpaid') {
    return 'Chưa thanh toán';
  }
  if (t === 'partially_paid' || t === 'partial') {
    return 'Thanh toán một phần';
  }
  const trimmed = (raw ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function PaymentDetailScreen({
  paymentRef,
  onOpenDrawer,
  onBack,
  onOpenOrder,
}: PaymentDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const qaNeutral = quickActionPaint(palette, 'neutral');
  const styles = useThemeStyleSheet(create_PaymentDetailScreen_styles);
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );

  function statusPillBg(s: PaymentListRowStatus) {
    switch (s) {
      case 'pending':
        return styles.pillOrange;
      case 'completed':
        return styles.pillGreen;
      case 'failed':
        return styles.pillRed;
      case 'cancelled':
        return styles.pillMuted;
      default:
        return styles.pillMuted;
    }
  }

  const [data, setData] = useState<PaymentDetailDataApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const [main, att] = await Promise.all([
        getPaymentDetail(paymentRef, { include: PAYMENT_DETAIL_INCLUDE }),
        getPaymentDetail(paymentRef, {
          include: PAYMENT_DETAIL_ATTACHMENTS_INCLUDE,
        }).catch((): null => null),
      ]);
      const merged: PaymentDetailDataApi = {
        ...main,
        attachments: att?.attachments ?? main.attachments ?? [],
      };
      setData(merged);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được thanh toán';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setData(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [paymentRef, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const so = data ? pickSaleOrder(data) : null;
  const sym = data ? paymentCurrencySymbol(data, so) : 'đ';
  const amountStr = data ? fmtMoney(data.amount, sym) : null;
  const rowStatus = data
    ? apiPaymentListStatusToRowStatus(data.status)
    : 'unknown';
  const statusLab = paymentRowStatusLabel(rowStatus);
  const kind = data ? kindFromType(data.type) : 'payment';
  const typePillLab = kind === 'refund' ? 'Hoàn tiền' : 'Thanh toán';
  const methodLab = paymentMethodLabel(data?.payment_method);
  const customerName =
    so?.customer?.name?.trim() ||
    so?.customer?.full_name?.trim() ||
    so?.buyer_name?.trim() ||
    null;
  const orderNum = so?.order_number?.trim() || null;
  const orderTotalStr = so != null ? fmtMoney(so.total, sym) : null;
  const orderPaymentStatus = orderPaymentStatusLabel(so?.payment_status);
  const paidAtLine = formatDateTimeVi(
    data?.paid_at ?? data?.created_at ?? null,
  );
  const paidAtDateOnly = formatDateVi(
    data?.paid_at ?? data?.created_at ?? null,
  );
  const processedAtLine = formatDateTimeVi(data?.processed_at ?? null);
  const processorName = data?.processor?.name?.trim() || '';
  const bank = data?.bank_account;
  const bankLine2 = [bank?.account_number?.trim(), bank?.account_name?.trim()]
    .filter(Boolean)
    .join(' - ');
  const bankSummary =
    bank?.bank_name?.trim() || bankLine2
      ? [bank?.bank_name?.trim(), bankLine2].filter(Boolean).join('\n')
      : '';
  const attachments = data?.attachments ?? [];
  const attachmentRows = useMemo(
    () => attachments.map(paymentAttachmentToRow),
    [attachments],
  );

  const openAttachment = useCallback(async (url: string | null) => {
    if (!url) {
      toast.info('Không có liên kết tải tệp.');
      return;
    }
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        toast.error('Không mở được liên kết tệp.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      toast.error('Không mở được liên kết tệp.');
    }
  }, []);

  const onUploadAttachment = useCallback(async () => {
    if (uploadingAttachment) {
      return;
    }
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.9,
      });
      if (res.didCancel) {
        return;
      }
      if (res.errorMessage) {
        toast.error(res.errorMessage);
        return;
      }
      const asset = res.assets?.[0];
      if (!asset?.uri) {
        return;
      }
      setUploadingAttachment(true);
      await uploadPaymentAttachment(paymentRef, {
        uri: asset.uri,
        type: asset.type ?? 'image/jpeg',
        name: asset.fileName ?? `payment_${Date.now()}.jpg`,
      });
      toast.success('Đã tải lên tệp đính kèm.');
      await load();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : 'Không tải lên được tệp đính kèm.',
      );
    } finally {
      setUploadingAttachment(false);
    }
  }, [uploadingAttachment, paymentRef, load]);

  const headerUuid = useMemo(
    () => data?.uuid?.trim() || paymentRef.trim(),
    [data?.uuid, paymentRef],
  );

  const heroTrailing = useMemo(
    () => (
      <View style={styles.heroIconPh}>
        <SystemIcon name="card" size={26} color={palette.textMuted} />
      </View>
    ),
    [styles.heroIconPh, palette.textMuted],
  );

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
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              setRefreshing(true);
              void load();
            }}
            style={styles.refreshHit}
            hitSlop={10}
          >
            <SystemIcon name="refresh" size={22} color={palette.cyan} />
          </Pressable>
        </View>

        <Text style={styles.breadcrumb} numberOfLines={2}>
          Thanh toán
          {headerUuid ? ` · ${headerUuid.slice(0, 8)}…` : ''}
        </Text>

        {loading && !data ? (
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
              <Pressable onPress={() => void load(true)} style={styles.retryBtn}>
                <Text style={styles.retryTxt}>Thử lại</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : data ? (
          <View style={detailScreenBody}>
            <View style={detailScreenMainColumn}>
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
                  title={amountStr ?? '—'}
                  subtitle={methodLab}
                  healthLabel="Ngày thanh toán"
                  healthValue={paidAtDateOnly}
                  statusSlot={
                    <View style={styles.pillRow}>
                      <View
                        style={[
                          styles.pill,
                          kind === 'refund'
                            ? styles.typeRefundPill
                            : styles.typePill,
                        ]}
                      >
                        <View style={styles.pillIconRow}>
                          <SystemIcon
                            name={kind === 'refund' ? 'arrowUp' : 'arrowDown'}
                            size={12}
                            color={
                              kind === 'refund' ? palette.orange : palette.green
                            }
                          />
                          <Text
                            style={
                              kind === 'refund'
                                ? styles.typeRefundPillTxt
                                : styles.typePillTxt
                            }
                          >
                            {typePillLab}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.pill, statusPillBg(rowStatus)]}>
                        <View style={styles.pillIconRow}>
                          {rowStatus === 'completed' ? (
                            <SystemIcon
                              name="check"
                              size={12}
                              color={palette.textPrimary}
                            />
                          ) : null}
                          <Text style={styles.pillTxt}>{statusLab}</Text>
                        </View>
                      </View>
                    </View>
                  }
                  trailing={heroTrailing}
                  footer={
                    <Text style={styles.heroUuid} selectable numberOfLines={1}>
                      {headerUuid}
                      {processorName
                        ? ` · ${processorName}`
                        : ''}
                    </Text>
                  }
                />

                <DetailCard title="Thông tin thanh toán" icon="card">
                  {amountStr ? (
                    <DetailRow label="Số tiền" value={amountStr} />
                  ) : null}
                  <DetailRow label="Phương thức" value={methodLab} />
                  <DetailRow label="Ngày thanh toán" value={paidAtLine} />
                  {processedAtLine !== '—' ? (
                    <DetailRow label="Thời gian xử lý" value={processedAtLine} />
                  ) : null}
                  {bank?.bank_name?.trim() ? (
                    <DetailRow label="Ngân hàng" value={bank.bank_name.trim()} />
                  ) : null}
                  {bankLine2 ? (
                    <DetailRow label="Tài khoản" value={bankLine2} />
                  ) : null}
                  {processorName ? (
                    <DetailRow label="Người xử lý" value={processorName} />
                  ) : null}
                </DetailCard>

                <DetailCard title="Đơn hàng liên quan" icon="cart">
                  {orderNum ? (
                    <DetailRow label="Mã đơn" value={orderNum} />
                  ) : null}
                  {orderTotalStr ? (
                    <DetailRow label="Tổng tiền" value={orderTotalStr} />
                  ) : null}
                  {customerName ? (
                    <DetailRow label="Khách hàng" value={customerName} />
                  ) : null}
                  {orderPaymentStatus ? (
                    <DetailRow
                      label="Trạng thái thanh toán"
                      value={orderPaymentStatus}
                    />
                  ) : null}
                </DetailCard>

                <DetailCard title="Tệp đính kèm" icon="paperclip">
                  {attachmentRows.length === 0 ? (
                    <Text style={styles.attachEmpty}>
                      Chưa có tệp đính kèm nào cho thanh toán này
                    </Text>
                  ) : (
                    attachmentRows.map(row => (
                      <Pressable
                        key={row.id}
                        style={({ pressed }) => [
                          styles.attachItem,
                          row.url && pressed && styles.attachItemPressed,
                        ]}
                        onPress={() => void openAttachment(row.url)}
                        disabled={!row.url}
                      >
                        <SystemIcon
                          name="paperclip"
                          size={14}
                          color={palette.textMuted}
                        />
                        <View style={styles.attachItemBody}>
                          <Text style={styles.attachItemTxt} numberOfLines={2}>
                            {row.name}
                          </Text>
                          {row.metaLine ? (
                            <Text style={styles.attachItemMeta} numberOfLines={2}>
                              {row.metaLine}
                            </Text>
                          ) : null}
                        </View>
                        {row.url ? (
                          <SystemIcon
                            name="chevronForward"
                            size={16}
                            color={palette.textMuted}
                          />
                        ) : null}
                      </Pressable>
                    ))
                  )}
                  <Pressable
                    style={[
                      styles.uploadTop,
                      uploadingAttachment && styles.uploadTopDisabled,
                    ]}
                    onPress={() => void onUploadAttachment()}
                    disabled={uploadingAttachment}
                  >
                    {uploadingAttachment ? (
                      <ActivityIndicator size="small" color={palette.cyan} />
                    ) : (
                      <SystemIcon name="arrowUp" size={14} color={palette.cyan} />
                    )}
                    <Text style={styles.uploadTopTxt}>
                      {uploadingAttachment
                        ? 'Đang tải lên…'
                        : 'Tải lên tệp đính kèm'}
                    </Text>
                  </Pressable>
                </DetailCard>

                <View style={dockInScroll.section}>
                  <View style={qd.dockCard}>
                    <Text style={qd.dockTitle}>Thao tác nhanh</Text>
                    <Pressable
                      style={({ pressed }) => [
                        qd.dockBtn,
                        {
                          backgroundColor: qaNeutral.bg,
                          borderColor: qaNeutral.border,
                        },
                        !orderNum && qd.dockBtnDisabled,
                        pressed && orderNum && qd.dockBtnPressed,
                      ]}
                      disabled={!orderNum}
                      onPress={() =>
                        orderNum
                          ? onOpenOrder
                            ? onOpenOrder(orderNum)
                            : toast.info(orderNum)
                          : undefined
                      }
                    >
                      <SystemIcon
                        name="cart"
                        size={16}
                        color={orderNum ? qaNeutral.fg : palette.textMuted}
                      />
                      <Text
                        style={[
                          qd.dockBtnLabel,
                          {
                            color: orderNum ? qaNeutral.fg : palette.textMuted,
                          },
                          !orderNum && qd.dockBtnLabelMuted,
                        ]}
                      >
                        Xem đơn hàng
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function create_PaymentDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 12,
    },
    refreshHit: { padding: 8, marginTop: 4 },
    breadcrumb: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 10,
      lineHeight: 18,
      paddingHorizontal: 16,
    },
    errBox: {
      marginTop: 8,
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 14, fontWeight: '600', color: c.red, marginBottom: 12 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.cyan },
    heroIconPh: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroUuid: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 8,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10,
    },
    pill: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    pillTxt: { fontSize: 11, fontWeight: '800', color: c.textPrimary },
    pillIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    typePill: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    typePillTxt: { fontSize: 11, fontWeight: '800', color: c.green },
    typeRefundPill: {
      backgroundColor: c.orangeBg,
      borderColor: c.orangeBorder,
    },
    typeRefundPillTxt: { fontSize: 11, fontWeight: '800', color: c.orange },
    pillGreen: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    pillOrange: {
      backgroundColor: c.orangeBg,
      borderColor: c.orangeBorder,
    },
    pillRed: {
      backgroundColor: c.redBg,
      borderColor: c.redBorder,
    },
    pillMuted: {
      backgroundColor: c.statusNeutralBg,
      borderColor: c.border,
    },
    uploadTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    uploadTopDisabled: { opacity: 0.55 },
    uploadTopTxt: { fontSize: 12, fontWeight: '800', color: c.cyan },
    attachEmpty: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 10,
    },
    attachItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    attachItemPressed: { opacity: 0.72 },
    attachItemBody: { flex: 1, minWidth: 0 },
    attachItemTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    attachItemMeta: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 2,
    },
  });
}
