import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';

import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { quickActionPaint } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { confirmDialog, toast } from '@shared/components/ui/appFeedback/appFeedback';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  settlementDetailTabsForAppRole,
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
import {
  StatusPill,
  type StatusPillTone,
} from '@shared/components/ui/StatusPill';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '@shared/components/ui/canvasDetail/CanvasDetailPanel';
import { formatOrderDateVi } from '../../sales/screens/orderDetail/orderDetailFormatters';
import {
  acceptSettlementPayment,
  cancelSettlement,
  confirmSettlement,
  getSettlementDetail,
  settleSettlement,
  SETTLEMENT_DETAIL_INCLUDE,
  SETTLEMENTS_LIST_INCLUDE,
} from '@services/finance/settlementAPI';
import type { SettlementApi } from '@services/finance/settlementApiTypes';
import {
  apiSettlementStatusToRowStatus,
  mapSettlementPaymentDirection,
  settlementCurrencySymbol,
  settlementPrimaryLineItem,
  settlementRowStatusLabel,
  settlementToNum,
} from '@mappers/finance/settlementListMappers';
import { SettlementDetailTabBar } from './settlementDetail/SettlementDetailTabBar';
import { SettlementDetailTabPanels } from './settlementDetail/SettlementDetailTabPanels';
import type { SettlementDetailTabId } from './settlementDetail/settlementDetailTypes';

export type SettlementDetailScreenProps = {
  settlementRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
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

function settlementStatusPillTone(
  s: ReturnType<typeof apiSettlementStatusToRowStatus>,
): StatusPillTone {
  if (s === 'settled') {
    return 'success';
  }
  if (s === 'confirmed') {
    return 'info';
  }
  if (s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

export function SettlementDetailScreen({
  settlementRef,
  onOpenDrawer,
  onBack,
}: SettlementDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_SettlementDetailScreen_styles);
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );
  const qaSuccess = quickActionPaint(palette, 'success');
  const qaDanger = quickActionPaint(palette, 'danger');
  const appRole = useAppSelector(selectNormalizedAppRole);
  const settlementDetailTabs = useMemo(
    () => settlementDetailTabsForAppRole(appRole),
    [appRole],
  );

  const [data, setData] = useState<SettlementApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<SettlementDetailTabId>('info');
  const [confirming, setConfirming] = useState(false);
  const [settling, setSettling] = useState(false);
  const [acceptingPayment, setAcceptingPayment] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelDraft, setCancelDraft] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await getSettlementDetail(settlementRef, {
        include: SETTLEMENT_DETAIL_INCLUDE,
      });
      setData(d);
    } catch {
      try {
        const d = await getSettlementDetail(settlementRef, {
          include: SETTLEMENTS_LIST_INCLUDE,
        });
        setData(d);
        setError(null);
      } catch (e2: unknown) {
        setData(null);
        setError(e2 instanceof Error ? e2.message : 'Không tải được đối soát');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [settlementRef]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    setTab(prev => coerceDetailActiveTabId(prev, settlementDetailTabs, 'info'));
  }, [settlementDetailTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const showApiError = useCallback((e: unknown, fallback: string) => {
    toast.error(e instanceof Error ? e.message : fallback);
  }, []);

  const runConfirm = useCallback(async () => {
    if (confirming) {
      return;
    }
    setConfirming(true);
    try {
      const next = await confirmSettlement(settlementRef);
      setData(next);
      toast.success('Bảng quyết toán đã được xác nhận.');
    } catch (e: unknown) {
      showApiError(e, 'Không xác nhận được đối soát');
    } finally {
      setConfirming(false);
    }
  }, [confirming, settlementRef, showApiError]);

  const runSettle = useCallback(async () => {
    if (settling) {
      return;
    }
    setSettling(true);
    try {
      const next = await settleSettlement(settlementRef);
      setData(next);
      toast.success('Bảng quyết toán đã hoàn tất.');
    } catch (e: unknown) {
      showApiError(e, 'Không hoàn tất được đối soát');
    } finally {
      setSettling(false);
    }
  }, [settling, settlementRef, showApiError]);

  const runAcceptPayment = useCallback(async () => {
    if (acceptingPayment) {
      return;
    }
    setAcceptingPayment(true);
    try {
      const next = await acceptSettlementPayment(settlementRef);
      setData(next);
      toast.success('Đã ghi nhận thanh toán cho đối soát này.');
    } catch (e: unknown) {
      showApiError(e, 'Không ghi nhận được thanh toán');
    } finally {
      setAcceptingPayment(false);
    }
  }, [acceptingPayment, settlementRef, showApiError]);

  const openCancelModal = useCallback(() => {
    setCancelDraft('');
    setCancelModalVisible(true);
  }, []);

  const closeCancelModal = useCallback(() => {
    if (cancelling) {
      return;
    }
    setCancelModalVisible(false);
  }, [cancelling]);

  const submitCancel = useCallback(async () => {
    const reason = cancelDraft.trim();
    if (!reason) {
      toast.warning('Vui lòng nhập lý do hủy đối soát.');
      return;
    }
    setCancelling(true);
    try {
      const next = await cancelSettlement(settlementRef, reason);
      setData(next);
      setCancelModalVisible(false);
      setCancelDraft('');
      toast.success('Bảng quyết toán đã được hủy.');
    } catch (e: unknown) {
      showApiError(e, 'Không hủy được đối soát');
    } finally {
      setCancelling(false);
    }
  }, [cancelDraft, settlementRef, showApiError]);

  const items = data?.items ?? [];
  const line = data ? settlementPrimaryLineItem(data) : null;
  const sym = settlementCurrencySymbol(line);
  const rowStatus = data
    ? apiSettlementStatusToRowStatus(data.status)
    : 'draft';
  const statusLabel = settlementRowStatusLabel(rowStatus);
  const settlementPillTone = settlementStatusPillTone(rowStatus);
  const { dir, label: dirLabel } = mapSettlementPaymentDirection(
    line?.payment_direction,
  );
  const warehouseName =
    data?.warehouse?.name?.trim() ||
    (data?.warehouse_id != null ? `Kho #${data.warehouse_id}` : null);
  const sellerCode =
    data?.seller?.code?.trim() || data?.seller?.legacy_id?.trim() || '';

  const codDisplay = useMemo(() => {
    if (!line) {
      return null;
    }
    return fmtMoneyNum(line.cod_collected, sym);
  }, [line, sym]);

  const feeDisplay = useMemo(() => {
    if (!line) {
      return null;
    }
    const n = settlementToNum(line.total_payable);
    return fmtMoneyNum(Number.isFinite(n) ? Math.abs(n) : n, sym);
  }, [line, sym]);

  const netDisplay = useMemo(() => {
    if (!line) {
      return null;
    }
    return fmtMoneyNum(line.net_amount, sym);
  }, [line, sym]);

  const canConfirm = data?.can_be_confirmed === true;
  const canSettle = data?.can_be_settled === true;
  const canAcceptPayment = data?.can_accept_payment === true;
  const canCancel = data?.can_be_cancelled === true;

  const heroTrailing = useMemo(
    () => (
      <View style={styles.heroIconPh}>
        <SystemIcon name="clipboard" size={26} color={palette.textMuted} />
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
        <Text style={styles.breadcrumb} numberOfLines={2}>
          Đối soát
          {data?.settlement_number ? ` · ${data.settlement_number}` : ''}
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
              <Pressable onPress={() => void load()} style={styles.retryBtn}>
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
                  title={data.settlement_number}
                  subtitle={data.seller?.name?.trim() || '—'}
                  healthLabel="Kỳ đối soát"
                  healthValue={`${formatOrderDateVi(data.period_from)} – ${formatOrderDateVi(data.period_to)}`}
                  statusSlot={
                    <View style={styles.pillRow}>
                      <StatusPill tone={settlementPillTone} emphasized>
                        {statusLabel}
                      </StatusPill>
                      {warehouseName ? (
                        <View style={styles.whPill}>
                          <View style={styles.pillIconRow}>
                            <SystemIcon
                              name="business"
                              size={12}
                              color={palette.teal}
                            />
                            <Text style={styles.whPillTxt}>{warehouseName}</Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  }
                  trailing={heroTrailing}
                  footer={
                    sellerCode ? (
                      <Text style={styles.heroMeta} numberOfLines={1}>
                        Mã seller: {sellerCode}
                      </Text>
                    ) : undefined
                  }
                />

                <View style={styles.formulaBanner}>
                  <SystemIcon name="info" size={18} color={palette.blue} />
                  <View style={styles.formulaBannerTextCol}>
                    <Text style={styles.formulaBannerTitle}>
                      Tiền quyết toán = COD thu hộ − Phí dịch vụ
                    </Text>
                    {rowStatus === 'draft' ? (
                      <Text style={styles.formulaBannerDraft}>
                        Bảng quyết toán đang ở trạng thái nháp. Sau khi xác
                        nhận, số liệu sẽ khóa theo kỳ đối soát.
                      </Text>
                    ) : null}
                  </View>
                </View>

                <SettlementDetailTabBar
                  tabs={settlementDetailTabs}
                  activeTab={tab}
                  itemCount={items.length}
                  onSelectTab={setTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <SettlementDetailTabPanels activeTab={tab} data={data} />
                </View>

                <DetailCard title="Tổng hợp đối soát" icon="cash">
                  {codDisplay ? (
                    <View style={styles.sumRow}>
                      <Text style={styles.sumLab}>COD đã thu</Text>
                      <Text style={styles.sumCod}>{codDisplay}</Text>
                    </View>
                  ) : null}
                  {feeDisplay ? (
                    <View style={styles.sumRow}>
                      <Text style={styles.sumLab}>Tổng phí</Text>
                      <Text style={styles.sumFee}>{feeDisplay}</Text>
                    </View>
                  ) : null}
                  {netDisplay ? (
                    <View style={styles.sumRow}>
                      <Text style={styles.sumLab}>Số tiền ròng</Text>
                      <Text style={styles.sumNet}>{netDisplay}</Text>
                    </View>
                  ) : null}
                  <View style={styles.sumRowLast}>
                    <Text style={styles.sumLab}>Chiều thanh toán</Text>
                    <View
                      style={[
                        styles.dirBadge,
                        dir === 'seller_pays_tosol'
                          ? styles.dirBadgeOrange
                          : styles.dirBadgeTeal,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dirBadgeTxt,
                          dir === 'seller_pays_tosol'
                            ? styles.dirBadgeTxtOrange
                            : styles.dirBadgeTxtTeal,
                        ]}
                        numberOfLines={2}
                      >
                        {dirLabel}
                      </Text>
                    </View>
                  </View>
                </DetailCard>

                <View style={dockInScroll.section}>
                  <View style={qd.dockCard}>
                    <Text style={qd.dockTitle}>Thao tác nhanh</Text>
                    <View style={qd.dockCol}>
                      {canConfirm ? (
                        <Pressable
                          disabled={confirming}
                          style={({ pressed }) => [
                            qd.dockBtn,
                            {
                              backgroundColor: qaSuccess.bg,
                              borderColor: qaSuccess.border,
                            },
                            pressed && qd.dockBtnPressed,
                            confirming && styles.dockBtnDisabled,
                          ]}
                          onPress={async () => {
                            const ok = await confirmDialog({
                              title: 'Xác nhận',
                              message: 'Xác nhận bảng quyết toán này? Sau khi xác nhận, số liệu sẽ khóa theo kỳ.',
                              confirmText: 'Xác nhận',
                            });
                            if (ok) { runConfirm().catch(() => {}); }
                          }}
                        >
                          {confirming ? (
                            <ActivityIndicator size="small" color={qaSuccess.fg} />
                          ) : (
                            <SystemIcon
                              name="check"
                              size={16}
                              color={qaSuccess.fg}
                            />
                          )}
                          <Text
                            style={[qd.dockBtnLabel, { color: qaSuccess.fg }]}
                          >
                            Xác nhận
                          </Text>
                        </Pressable>
                      ) : null}
                      {canSettle ? (
                        <Pressable
                          disabled={settling}
                          style={({ pressed }) => [
                            qd.dockBtn,
                            {
                              backgroundColor: qaSuccess.bg,
                              borderColor: qaSuccess.border,
                            },
                            pressed && qd.dockBtnPressed,
                            settling && styles.dockBtnDisabled,
                          ]}
                          onPress={async () => {
                            const ok = await confirmDialog({
                              title: 'Quyết toán',
                              message: 'Đánh dấu hoàn tất quyết toán cho bảng này?',
                              confirmText: 'Hoàn tất',
                            });
                            if (ok) { runSettle().catch(() => {}); }
                          }}
                        >
                          {settling ? (
                            <ActivityIndicator size="small" color={qaSuccess.fg} />
                          ) : (
                            <SystemIcon
                              name="cash"
                              size={16}
                              color={qaSuccess.fg}
                            />
                          )}
                          <Text
                            style={[qd.dockBtnLabel, { color: qaSuccess.fg }]}
                          >
                            Quyết toán
                          </Text>
                        </Pressable>
                      ) : null}
                      {canAcceptPayment ? (
                        <Pressable
                          disabled={acceptingPayment}
                          style={({ pressed }) => [
                            qd.dockBtn,
                            {
                              backgroundColor: qaSuccess.bg,
                              borderColor: qaSuccess.border,
                            },
                            pressed && qd.dockBtnPressed,
                            acceptingPayment && styles.dockBtnDisabled,
                          ]}
                          onPress={async () => {
                            const ok = await confirmDialog({
                              title: 'Ghi nhận thanh toán',
                              message: 'Ghi nhận đã thanh toán cho bảng quyết toán này?',
                              confirmText: 'Ghi nhận',
                            });
                            if (ok) { runAcceptPayment().catch(() => {}); }
                          }}
                        >
                          {acceptingPayment ? (
                            <ActivityIndicator size="small" color={qaSuccess.fg} />
                          ) : (
                            <SystemIcon
                              name="card"
                              size={16}
                              color={qaSuccess.fg}
                            />
                          )}
                          <Text
                            style={[qd.dockBtnLabel, { color: qaSuccess.fg }]}
                          >
                            Ghi nhận thanh toán
                          </Text>
                        </Pressable>
                      ) : null}
                      {canCancel ? (
                        <Pressable
                          disabled={cancelling}
                          style={({ pressed }) => [
                            qd.dockBtn,
                            {
                              backgroundColor: qaDanger.bg,
                              borderColor: qaDanger.border,
                            },
                            pressed && qd.dockBtnPressed,
                            cancelling && styles.dockBtnDisabled,
                          ]}
                          onPress={openCancelModal}
                        >
                          <SystemIcon
                            name="close"
                            size={16}
                            color={qaDanger.fg}
                          />
                          <Text
                            style={[qd.dockBtnLabel, { color: qaDanger.fg }]}
                          >
                            Hủy
                          </Text>
                        </Pressable>
                      ) : null}
                      {!canConfirm &&
                      !canSettle &&
                      !canAcceptPayment &&
                      !canCancel ? (
                        <Text style={styles.dockEmptyHint}>
                          Không có thao tác nhanh cho trạng thái hiện tại.
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCancelModal}
      >
        <KeyboardAvoidingView style={styles.modalKb} behavior="padding">
          <Pressable style={styles.modalOverlay} onPress={closeCancelModal}>
            <Pressable
              style={styles.modalCard}
              onPress={e => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Hủy đối soát</Text>
              <Text style={styles.modalHint}>
                Nhập lý do hủy. Bảng quyết toán sẽ chuyển sang trạng thái đã
                hủy và không thể khôi phục.
              </Text>
              <TextInput
                value={cancelDraft}
                onChangeText={setCancelDraft}
                placeholder="Lý do hủy đối soát…"
                placeholderTextColor={palette.textMuted}
                multiline
                editable={!cancelling}
                style={styles.modalInput}
                textAlignVertical="top"
              />
              <View style={styles.modalActions}>
                <Pressable
                  onPress={closeCancelModal}
                  disabled={cancelling}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    styles.modalBtnGhost,
                    pressed && !cancelling && styles.modalBtnPressed,
                    cancelling && styles.modalBtnDisabled,
                  ]}
                >
                  <Text style={styles.modalBtnGhostTxt}>Đóng</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    submitCancel().catch(() => {});
                  }}
                  disabled={cancelling}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    styles.modalBtnDanger,
                    pressed && !cancelling && styles.modalBtnPressed,
                    cancelling && styles.modalBtnDisabled,
                  ]}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalBtnDangerTxt}>Hủy đối soát</Text>
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

function create_SettlementDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    breadcrumb: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 10,
      lineHeight: 18,
      paddingHorizontal: 16,
    },

    errBox: {
      margin: 16,
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
    pillIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    statusPillRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    whPill: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: 'rgba(45,212,191,0.12)',
      borderColor: 'rgba(45,212,191,0.45)',
    },
    whPillTxt: { fontSize: 11, fontWeight: '800', color: c.tealLight },
    heroMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    formulaBanner: {
      marginHorizontal: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(96,165,250,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(96,165,250,0.35)',
    },
    formulaBannerTextCol: { flex: 1, minWidth: 0 },
    formulaBannerTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.blue,
      lineHeight: 19,
    },
    formulaBannerDraft: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 17,
    },
    dockEmptyHint: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 17,
      paddingVertical: 4,
    },
    sumRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    sumRowLast: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
    },
    sumLab: { fontSize: 13, fontWeight: '700', color: c.textMuted },
    sumCod: { fontSize: 15, fontWeight: '800', color: c.green },
    sumFee: { fontSize: 15, fontWeight: '800', color: c.red },
    sumNet: { fontSize: 15, fontWeight: '800', color: c.textPrimary },
    dirBadge: {
      maxWidth: '58%',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
    },
    dirBadgeOrange: {
      backgroundColor: 'rgba(180,130,70,0.2)',
      borderColor: 'rgba(212,165,116,0.45)',
    },
    dirBadgeTeal: {
      backgroundColor: 'rgba(45,212,191,0.12)',
      borderColor: 'rgba(45,212,191,0.4)',
    },
    dirBadgeTxt: { fontSize: 11, fontWeight: '800', textAlign: 'right' },
    dirBadgeTxtOrange: { color: '#d4a574' },
    dirBadgeTxtTeal: { color: c.tealLight },
    dockBtnDisabled: { opacity: 0.5 },
    modalKb: { flex: 1 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalCard: {
      backgroundColor: c.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 18,
      gap: 12,
    },
    modalTitle: { fontSize: 16, fontWeight: '800', color: c.textPrimary },
    modalHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 18,
    },
    modalInput: {
      minHeight: 96,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: c.textPrimary,
      backgroundColor: c.bgInput,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      minWidth: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBtnGhost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.border,
    },
    modalBtnGhostTxt: { fontSize: 14, fontWeight: '700', color: c.textSecondary },
    modalBtnDanger: { backgroundColor: c.red },
    modalBtnDangerTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
    modalBtnPressed: { opacity: 0.85 },
    modalBtnDisabled: { opacity: 0.5 },
  });
}
