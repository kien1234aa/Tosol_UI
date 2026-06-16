import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  purchaseOrderDetailTabsForAppRole,
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
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { formatDateVi } from '../../sales/screens/orderDetail/orderDetailFormatters';
import {
  mapApiPoRowStatus,
  poStatusLabel,
  purchaseOrderToListRow,
} from '@mappers/warehouse/purchaseMappers';
import {
  cancelPurchaseOrder,
  getPurchaseOrderDetail,
} from '@services/warehouse/purchaseOrderAPI';
import type {
  PurchaseOrderApi,
  PurchaseOrderInboundApi,
} from '@services/warehouse/purchaseOrderApiTypes';
import type { PurchaseOrderDetailTabId } from './purchaseOrderDetail/poDetailTypes';
import {
  PurchaseOrderDetailOverviewSection,
  PurchaseOrderDetailQuickDock,
} from './purchaseOrderDetail/PurchaseOrderDetailScrollFooter';
import { PurchaseOrderDetailTabBar } from './purchaseOrderDetail/PurchaseOrderDetailTabBar';
import { PurchaseOrderDetailTabPanels } from './purchaseOrderDetail/PurchaseOrderDetailTabPanels';
import { PurchaseOrderDetailActivityLogPanel } from './purchaseOrderDetail/PurchaseOrderDetailActivityLogPanel';

export type PurchaseOrderDetailScreenProps = {
  orderRef: string;
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Mở form sửa (tái dùng màn tạo đơn). */
  onEditPurchaseOrder?: (orderRef: string) => void;
};

function statusBannerMessage(po: PurchaseOrderApi): string | null {
  const st = (po.status ?? '').toLowerCase().trim();
  if (st === 'confirmed') {
    return po.supplier?.name
      ? 'Nhà cung cấp đã xác nhận. Chờ giao hàng đến kho'
      : 'Đơn đã xác nhận. Chờ giao hàng đến kho';
  }
  if (st === 'partial_received' || st === 'partial') {
    return 'Đã nhận một phần hàng vào kho.';
  }
  if (st === 'received' || st === 'fully_received') {
    return 'Đã nhận đủ hàng vào kho.';
  }
  return null;
}

const CANCEL_REASON_MAX = 500;

export function PurchaseOrderDetailScreen({
  orderRef,
  onOpenDrawer,
  onBack,
  onEditPurchaseOrder,
}: PurchaseOrderDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_PurchaseOrderDetailScreen_styles);
  const dockInScroll = useThemeStyleSheet(
    createDetailQuickDockInScrollSectionStyles,
  );

  const insets = useSafeAreaInsets();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const poDetailTabs = useMemo(
    () => purchaseOrderDetailTabsForAppRole(appRole),
    [appRole],
  );
  const [po, setPo] = useState<PurchaseOrderApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PurchaseOrderDetailTabId>('info');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReasonDraft, setCancelReasonDraft] = useState('');
  const cancelReasonInputRef = useRef<TextInput>(null);
  const [cancellingPo, setCancellingPo] = useState(false);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getPurchaseOrderDetail(orderRef.trim());
      setPo(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không tải được đơn mua hàng';
      toast.error(msg);
      if (goBackOnFail) {
        onBack();
      } else {
        setPo(null);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderRef, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load]);

  useEffect(() => {
    setActiveTab(prev => coerceDetailActiveTabId(prev, poDetailTabs, 'info'));
  }, [poDetailTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const closeCancelModal = useCallback(() => {
    if (!cancellingPo) {
      setCancelModalVisible(false);
      setCancelReasonDraft('');
    }
  }, [cancellingPo]);

  const onQuickActionPress = useCallback((key: string) => {
    if (key === 'cancel_po') {
      setCancelReasonDraft('');
      setCancelModalVisible(true);
      return;
    }
    toast.info('Chức năng này chưa được triển khai trên ứng dụng.');
  }, []);

  const submitCancelPurchaseOrder = useCallback(async () => {
    const reason = cancelReasonDraft.trim();
    if (!reason) {
      toast.warning('Vui lòng nhập lý do hủy đơn mua hàng.');
      return;
    }
    setCancellingPo(true);
    try {
      await cancelPurchaseOrder(orderRef.trim(), { reason });
      setCancelModalVisible(false);
      setCancelReasonDraft('');
      await load();
      toast.success('Đơn mua hàng đã được hủy.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Không hủy được đơn.');
    } finally {
      setCancellingPo(false);
    }
  }, [cancelReasonDraft, orderRef, load]);

  const decimals = po?.currency?.decimal_places ?? 0;
  const listRow = useMemo(() => (po ? purchaseOrderToListRow(po) : null), [po]);
  const banner = useMemo(() => (po ? statusBannerMessage(po) : null), [po]);
  const rowStatus = useMemo(
    () => mapApiPoRowStatus(po?.status ?? null),
    [po?.status],
  );
  const statusLabel = poStatusLabel(rowStatus);

  const firstInbound: PurchaseOrderInboundApi | null =
    po?.inbound_orders?.[0] ?? null;
  const items = po?.items ?? [];
  const itemCount = items.length;

  const totalQtyLabel = useMemo(() => {
    if (!listRow) {
      return '—';
    }
    return listRow.expectedQty.toLocaleString('vi-VN', {
      maximumFractionDigits: 2,
    });
  }, [listRow]);

  const heroSubtitle = useMemo(() => {
    const name = po?.supplier?.name?.trim();
    if (name) {
      return name;
    }
    return po?.note?.trim() || '';
  }, [po?.supplier?.name, po?.note]);

  const isPoCancelled = useMemo(() => {
    const s = (po?.status ?? '').toLowerCase();
    return s.includes('cancel');
  }, [po?.status]);

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
          Mua hàng
          {po?.order_number
            ? ` · Đơn mua hàng · ${po.order_number}`
            : ' · Đơn mua hàng'}
        </Text>

        {loading && !po ? (
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
        ) : po ? (
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
                  title={po.order_number ?? `PO#${po.id}`}
                  subtitle={heroSubtitle || po.warehouse?.name?.trim() || undefined}
                  healthLabel={listRow ? 'Tiến độ nhận' : 'Nhà cung cấp'}
                  healthValue={
                    listRow
                      ? `${listRow.receivedQty.toLocaleString('vi-VN')}/${listRow.expectedQty.toLocaleString('vi-VN')} (${listRow.progressPct}%)`
                      : po.supplier?.name?.trim() || '—'
                  }
                  statusSlot={
                    <View style={styles.pillRow}>
                      <View style={[styles.pill, styles.pillStatus]}>
                        <Text style={styles.pillTxt}>{statusLabel}</Text>
                      </View>
                      {po.warehouse?.name ? (
                        <View style={[styles.pill, styles.pillWh]}>
                          <Text style={styles.pillTxt} numberOfLines={2}>
                            {po.warehouse.name}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  }
                  footer={
                    listRow ? (
                      <View style={styles.metaRow}>
                        <View style={styles.metaItemRow}>
                          <SystemIcon
                            name="calendar"
                            size={12}
                            color={palette.textMuted}
                          />
                          <Text style={styles.metaItem} numberOfLines={1}>
                            {formatDateVi(po.expected_at ?? null)}
                          </Text>
                        </View>
                        <View style={styles.metaItemRow}>
                          <SystemIcon
                            name="truck"
                            size={12}
                            color={palette.textMuted}
                          />
                          <Text style={styles.metaItem} numberOfLines={1}>
                            {po.tracking_number?.trim() || '—'}
                          </Text>
                        </View>
                      </View>
                    ) : undefined
                  }
                />

                {banner ? (
                  <View style={styles.infoBanner}>
                    <SystemIcon name="info" size={18} color={palette.blue} />
                    <Text style={styles.infoBannerTxt}>{banner}</Text>
                  </View>
                ) : null}

                <PurchaseOrderDetailOverviewSection
                  po={po}
                  decimals={decimals}
                  itemCount={itemCount}
                  totalQtyLabel={totalQtyLabel}
                  listRow={listRow}
                />

                <View style={detailScreenTabPanelsPad}>
                  <PurchaseOrderDetailActivityLogPanel
                    purchaseOrderId={po.id}
                    reloadSignal={po.updated_at ?? po.id}
                  />
                </View>

                <PurchaseOrderDetailTabBar
                  tabs={poDetailTabs}
                  activeTab={activeTab}
                  itemCount={itemCount}
                  onSelectTab={setActiveTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <PurchaseOrderDetailTabPanels
                    activeTab={activeTab}
                    po={po}
                    listRow={listRow}
                    decimals={decimals}
                    items={items}
                    firstInbound={firstInbound}
                  />
                </View>

                <View style={dockInScroll.section}>
                  <PurchaseOrderDetailQuickDock
                    canCancelPurchaseOrder={!isPoCancelled}
                    onEditPress={
                      onEditPurchaseOrder && !isPoCancelled
                        ? () => onEditPurchaseOrder(orderRef)
                        : undefined
                    }
                    onQuickActionPress={onQuickActionPress}
                  />
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
        <KeyboardAvoidingView style={styles.cancelKb} behavior="padding">
          <View style={styles.cancelOverlay}>
            <Pressable
              style={styles.cancelBackdropFill}
              onPress={closeCancelModal}
              accessibilityLabel="Đóng"
            />
            <View style={styles.cancelCard}>
              <View style={styles.cancelHeaderRow}>
                <View style={styles.cancelIconCircle}>
                  <SystemIcon name="close" size={20} color="#fff" />
                </View>
                <Text style={styles.cancelTitle}>Hủy đơn mua hàng</Text>
              </View>

              <View style={styles.cancelWarnBox}>
                <SystemIcon name="warning" size={18} color={palette.orange} />
                <Text style={styles.cancelWarnTxt}>
                  Bạn có chắc muốn hủy đơn mua hàng này? Hành động này không thể
                  hoàn tác.
                </Text>
              </View>

              <Text style={styles.cancelFieldLab}>Lý do hủy</Text>
              <View style={styles.cancelInputWrap}>
                <TextInput
                  ref={cancelReasonInputRef}
                  value={cancelReasonDraft}
                  onChangeText={t =>
                    setCancelReasonDraft(t.slice(0, CANCEL_REASON_MAX))
                  }
                  placeholder="Nhập lý do hủy đơn mua hàng…"
                  placeholderTextColor={palette.textMuted}
                  multiline
                  editable={!cancellingPo}
                  style={styles.cancelInput}
                  textAlignVertical="top"
                  maxLength={CANCEL_REASON_MAX}
                  showSoftInputOnFocus
                  onFocus={() => {
                    if (Platform.OS === 'android') {
                      requestAnimationFrame(() => {
                        cancelReasonInputRef.current?.focus();
                      });
                    }
                  }}
                />
                <Text style={styles.cancelCounter}>
                  {cancelReasonDraft.length} / {CANCEL_REASON_MAX}
                </Text>
              </View>

              <View style={styles.cancelActions}>
                <Pressable
                  onPress={closeCancelModal}
                  disabled={cancellingPo}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    styles.cancelBtnGhost,
                    pressed && !cancellingPo && styles.cancelBtnPressed,
                    cancellingPo && styles.cancelBtnDisabled,
                  ]}
                >
                  <Text style={styles.cancelBtnGhostTxt}>Hủy</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void submitCancelPurchaseOrder();
                  }}
                  disabled={cancellingPo}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    styles.cancelBtnDanger,
                    pressed && !cancellingPo && styles.cancelBtnPressed,
                    cancellingPo && styles.cancelBtnDisabled,
                  ]}
                >
                  {cancellingPo ? (
                    <ActivityIndicator size="small" color={palette.red} />
                  ) : (
                    <View style={styles.cancelConfirmInner}>
                      <SystemIcon name="close" size={16} color={palette.red} />
                      <Text style={styles.cancelBtnDangerTxt}>
                        Xác Nhận Hủy
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function create_PurchaseOrderDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
    tabBodyPad: { paddingBottom: 12 },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 6,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    breadcrumb: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 10,
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
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 4,
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
    pill: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      maxWidth: '100%',
    },
    pillStatus: {
      backgroundColor: 'rgba(16,185,129,0.2)',
      borderColor: c.green,
    },
    pillWh: {
      backgroundColor: 'rgba(59,130,246,0.18)',
      borderColor: '#3b82f6',
    },
    pillTxt: { fontSize: 12, fontWeight: '800', color: c.textPrimary },
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
    cancelKb: { flex: 1 },
    cancelOverlay: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    cancelBackdropFill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.bgOverlay,
      zIndex: 0,
    },
    cancelCard: {
      backgroundColor: c.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      zIndex: 2,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    },
    cancelHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    cancelIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#4a2a38',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
    },
    cancelWarnBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(245,158,11,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(245,158,11,0.35)',
      marginBottom: 16,
    },
    cancelWarnTxt: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: '#f59e0b',
      lineHeight: 19,
    },
    cancelFieldLab: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 8,
    },
    cancelInputWrap: {
      position: 'relative',
      marginBottom: 18,
    },
    cancelInput: {
      minHeight: 100,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.teal,
      backgroundColor: c.bgInput,
      color: c.textPrimary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      paddingBottom: 28,
      fontSize: 15,
    },
    cancelCounter: {
      position: 'absolute',
      right: 10,
      bottom: 8,
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    cancelActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    cancelBtn: {
      minWidth: 96,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtnGhost: {
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    cancelBtnGhostTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textSecondary,
    },
    cancelBtnDanger: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    cancelBtnDangerTxt: { fontSize: 15, fontWeight: '800', color: c.red },
    cancelConfirmInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cancelBtnPressed: { opacity: 0.88 },
    cancelBtnDisabled: { opacity: 0.55 },
  });
}
