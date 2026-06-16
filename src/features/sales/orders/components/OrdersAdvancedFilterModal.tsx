import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import {
  FilterModalDateField,
  FilterModalDateSheet,
} from '@shared/components/ui/FilterModalDatePicker';
import {
  FilterSheetHostProvider,
  FilterSheetOverlay,
} from '@shared/components/ui/filterSheetHost';
import {
  dateToIsoDateOnly,
  isoDateOnlyToLocalDate,
} from '../../../category/priceList/components/datePickerUtils';
import type { SaleOrderListFilters } from '@services/sales/orderAPI';
import { EMPTY_SALE_ORDER_LIST_FILTERS } from '@services/sales/orderAPI';

export type OrdersAdvancedFilterModalProps = {
  visible: boolean;
  /** Bộ lọc đang áp dụng — đồng bộ khi mở modal. */
  appliedFilters: SaleOrderListFilters;
  /** Gợi ý phạm vi (vd. «Phạm vi: Cửa hàng X») — khi xem đơn theo từng shop. */
  scopeHint?: string;
  onClose: () => void;
  /** Áp dụng và đóng (đã chuẩn hoá: bỏ field rỗng). */
  onApply: (next: SaleOrderListFilters) => void;
};

type SelectOpt = { labelKey: string; value: string };

/**
 * Giá trị `filter[status]` — khớp backend TOSOL (snake_case).
 * Nếu API dùng slug khác (vd. `awaiting_transfer`), chỉnh `value` tương ứng.
 */
const STATUS_OPTS: SelectOpt[] = [
  { labelKey: 'orders.advFilter.all', value: '' },
  { labelKey: 'orders.pill.row.pending', value: 'pending' },
  { labelKey: 'orders.pill.row.confirmed', value: 'confirmed' },
  { labelKey: 'orders.pill.row.packing', value: 'packing' },
  {
    labelKey: 'orders.advFilter.apiStatus.pending_transfer',
    value: 'pending_transfer',
  },
  {
    labelKey: 'orders.advFilter.apiStatus.transferring',
    value: 'transferring',
  },
  { labelKey: 'orders.pill.row.transfer_failed', value: 'transfer_failed' },
  {
    labelKey: 'orders.advFilter.apiStatus.ready_to_ship',
    value: 'ready_to_ship',
  },
  { labelKey: 'orders.advFilter.apiStatus.shipped', value: 'shipped' },
  { labelKey: 'orders.pill.row.delivered', value: 'delivered' },
  { labelKey: 'orders.pill.row.returned', value: 'returned' },
  {
    labelKey: 'orders.pill.row.partially_returned',
    value: 'partially_returned',
  },
  { labelKey: 'orders.pill.row.cancelled', value: 'cancelled' },
];

/** Giá trị `filter[payment_status]` — khớp API sale-orders v2. */
const PAYMENT_OPTS: SelectOpt[] = [
  { labelKey: 'orders.advFilter.all', value: '' },
  { labelKey: 'orders.advFilter.payment.pending', value: 'pending' },
  { labelKey: 'orders.advFilter.payment.partial_paid', value: 'partial_paid' },
  { labelKey: 'orders.advFilter.payment.paid', value: 'paid' },
  { labelKey: 'orders.advFilter.payment.voided', value: 'voided' },
  {
    labelKey: 'orders.advFilter.payment.pending_refund',
    value: 'pending_refund',
  },
  { labelKey: 'orders.advFilter.payment.refunded', value: 'refunded' },
];

type IssueOptValue = '' | 'yes' | 'no';

const ISSUE_OPTS: { labelKey: string; value: IssueOptValue }[] = [
  { labelKey: 'orders.advFilter.all', value: '' },
  { labelKey: 'common.yes', value: 'yes' },
  { labelKey: 'common.no', value: 'no' },
];

const HEADER_FOOTER_EST = 200;

function countDraftConditions(
  d: SaleOrderListFilters,
  issueUi: IssueOptValue,
): number {
  let n = 0;
  if (d.filterStatus?.trim()) {
    n += 1;
  }
  if (d.filterPaymentStatus?.trim()) {
    n += 1;
  }
  if (issueUi) {
    n += 1;
  }
  if (d.filterDateFrom?.trim()) {
    n += 1;
  }
  if (d.filterDateTo?.trim()) {
    n += 1;
  }
  return n;
}

function cloneFilters(f: SaleOrderListFilters): SaleOrderListFilters {
  return { ...f };
}

function issueToUi(f: SaleOrderListFilters): IssueOptValue {
  if (f.filterHasIssue === true) {
    return 'yes';
  }
  if (f.filterHasIssue === false) {
    return 'no';
  }
  return '';
}

function issueFromUi(v: IssueOptValue): boolean | undefined {
  if (v === 'yes') {
    return true;
  }
  if (v === 'no') {
    return false;
  }
  return undefined;
}

function normalizeForApply(d: SaleOrderListFilters): SaleOrderListFilters {
  const out: SaleOrderListFilters = {};
  if (d.filterStatus?.trim()) {
    out.filterStatus = d.filterStatus.trim();
  }
  if (d.filterPaymentStatus?.trim()) {
    let ps = d.filterPaymentStatus.trim();
    if (ps === 'partial' || ps === 'partially_paid') {
      ps = 'partial_paid';
    }
    out.filterPaymentStatus = ps;
  }
  if (d.filterDateFrom?.trim()) {
    out.filterDateFrom = d.filterDateFrom.trim();
  }
  if (d.filterDateTo?.trim()) {
    out.filterDateTo = d.filterDateTo.trim();
  }
  if (d.filterHasIssue === true) {
    out.filterHasIssue = true;
  } else if (d.filterHasIssue === false) {
    out.filterHasIssue = false;
  }
  return out;
}

function labelForValue(
  opts: SelectOpt[],
  value: string | undefined,
  t: (key: string, o?: Record<string, string | number>) => string,
): string {
  const v = value?.trim() ?? '';
  if (!v) {
    return t(opts[0]?.labelKey ?? 'orders.advFilter.all');
  }
  const hit = opts.find(o => o.value === v);
  if (hit) {
    return t(hit.labelKey);
  }
  /** Vd. `confirmed,packing` từ ô thống kê — không có trong danh sách chọn. */
  return v;
}

/** Chuẩn hoá slug cũ → giá trị API hiện tại khi hiển thị nhãn thanh toán. */
function paymentFilterLabel(
  value: string | undefined,
  t: (key: string, o?: Record<string, string | number>) => string,
): string {
  const v = value?.trim() ?? '';
  const canonical =
    v === 'partial' || v === 'partially_paid' ? 'partial_paid' : v;
  return labelForValue(PAYMENT_OPTS, canonical || undefined, t);
}

function FilterSelectField({
  label,
  valueLabel,
  onPress,
  icon,
}: {
  label: string;
  valueLabel: string;
  onPress: () => void;
  icon: SystemIconName;
}) {
  const palette = useAppColors();
  const st = useThemeStyleSheet(createSelectFieldStyles);
  return (
    <Pressable
      onPress={onPress}
      style={st.outline}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[st.labCut, { backgroundColor: palette.bgCard }]}>
        <Text style={st.labTxt}>{label}</Text>
      </View>
      <View style={st.rowMain}>
        <View style={st.icoBox}>
          <SystemIcon name={icon} size={20} color={palette.textSecondary} />
        </View>
        <Text style={st.val} numberOfLines={2}>
          {valueLabel}
        </Text>
        <SystemIcon name="chevronDown" size={20} color={palette.textMuted} />
      </View>
    </Pressable>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: SystemIconName;
  title: string;
  subtitle?: string;
}) {
  const palette = useAppColors();
  const st = useThemeStyleSheet(createSectionHeaderStyles);
  return (
    <View style={st.wrap}>
      <View style={st.icoCircle}>
        <SystemIcon name={icon} size={18} color={palette.teal} />
      </View>
      <View style={st.textCol}>
        <Text style={st.title}>{title}</Text>
        {subtitle ? (
          <Text style={st.sub} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function OptionsModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  t,
}: {
  visible: boolean;
  title: string;
  options: SelectOpt[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  t: (key: string, o?: Record<string, string | number>) => string;
}) {
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const st = useThemeStyleSheet(createOptionsModalStyles);

  const renderItem = useCallback(
    ({ item }: { item: SelectOpt }) => {
      const sel = item.value === selectedValue;
      return (
        <Pressable
          style={[st.optRow, sel && st.optRowOn]}
          onPress={() => {
            onSelect(item.value);
            onClose();
          }}
        >
          <Text style={[st.optTxt, sel && st.optTxtOn]} numberOfLines={2}>
            {t(item.labelKey)}
          </Text>
          {sel ? (
            <SystemIcon name="check" size={20} color={palette.teal} />
          ) : null}
        </Pressable>
      );
    },
    [selectedValue, onSelect, onClose, t, st.optRow, st.optRowOn, st.optTxt, st.optTxtOn, palette.teal],
  );

  return (
    <FilterSheetOverlay
      visible={visible}
      onClose={onClose}
      sheetStyle={[
        st.sheet,
        {
          paddingBottom: insets.bottom + 12,
          maxHeight: winH * 0.55,
        },
      ]}
    >
      <Text style={st.sheetTitle}>{title}</Text>
      <FlatList
        data={options}
        keyExtractor={item => item.value || '__all__'}
        style={{ maxHeight: winH * 0.5 }}
        keyboardShouldPersistTaps="handled"
        renderItem={renderItem}
      />
    </FilterSheetOverlay>
  );
}

export function OrdersAdvancedFilterModal({
  visible,
  appliedFilters,
  scopeHint,
  onClose,
  onApply,
}: OrdersAdvancedFilterModalProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const st = useThemeStyleSheet(createModalStyles);
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const sheetLayout = useMemo(() => {
    const SHEET_MAX_H = Math.min(winH * 0.92, 760);
    const SHEET_W = Math.min(winW - 16, 560);
    const SCROLL_MAX_H = Math.max(220, SHEET_MAX_H - HEADER_FOOTER_EST);
    return { SHEET_MAX_H, SHEET_W, SCROLL_MAX_H };
  }, [winW, winH]);

  const [draft, setDraft] = useState<SaleOrderListFilters>(() =>
    cloneFilters(appliedFilters),
  );
  const [issueUi, setIssueUi] = useState<IssueOptValue>(() =>
    issueToUi(appliedFilters),
  );

  const [picker, setPicker] = useState<null | 'status' | 'payment' | 'issue'>(
    null,
  );
  const [datePicker, setDatePicker] = useState<'from' | 'to' | null>(null);
  const [dateDraft, setDateDraft] = useState(() => new Date());

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraft(cloneFilters(appliedFilters));
    setIssueUi(issueToUi(appliedFilters));
    setPicker(null);
    setDatePicker(null);
  }, [visible, appliedFilters]);

  const fromDate = useMemo(
    () => isoDateOnlyToLocalDate(draft.filterDateFrom ?? null),
    [draft.filterDateFrom],
  );
  const toDate = useMemo(
    () => isoDateOnlyToLocalDate(draft.filterDateTo ?? null),
    [draft.filterDateTo],
  );

  const openDatePicker = useCallback(
    (which: 'from' | 'to') => {
      setPicker(null);
      const current = which === 'from' ? fromDate : toDate;
      setDateDraft(current ?? new Date());
      setDatePicker(which);
    },
    [fromDate, toDate],
  );

  const closeDatePicker = useCallback(() => setDatePicker(null), []);

  const commitDatePicker = useCallback(() => {
    const iso = dateToIsoDateOnly(dateDraft);
    if (datePicker === 'from') {
      setDraft(prev => ({ ...prev, filterDateFrom: iso }));
    } else if (datePicker === 'to') {
      setDraft(prev => ({ ...prev, filterDateTo: iso }));
    }
    setDatePicker(null);
  }, [dateDraft, datePicker]);

  const statusLabel = useMemo(
    () => labelForValue(STATUS_OPTS, draft.filterStatus, t),
    [draft.filterStatus, t],
  );
  const paymentLabel = useMemo(
    () => paymentFilterLabel(draft.filterPaymentStatus, t),
    [draft.filterPaymentStatus, t],
  );
  const issueLabel = useMemo(() => {
    const hit = ISSUE_OPTS.find(o => o.value === issueUi);
    return hit ? t(hit.labelKey) : t('orders.advFilter.all');
  }, [issueUi, t]);

  const issueOptionsForPicker: SelectOpt[] = useMemo(
    () => ISSUE_OPTS.map(o => ({ labelKey: o.labelKey, value: o.value })),
    [],
  );

  const activeCount = useMemo(
    () => countDraftConditions(draft, issueUi),
    [draft, issueUi],
  );

  const resetDraft = useCallback(() => {
    setDraft({ ...EMPTY_SALE_ORDER_LIST_FILTERS });
    setIssueUi('');
  }, []);

  const apply = useCallback(() => {
    const merged: SaleOrderListFilters = {
      ...draft,
      filterHasIssue: issueFromUi(issueUi),
    };
    const fromS = merged.filterDateFrom?.trim();
    const toS = merged.filterDateTo?.trim();
    if (fromS && toS) {
      const fromD = isoDateOnlyToLocalDate(fromS);
      const toD = isoDateOnlyToLocalDate(toS);
      if (fromD && toD && fromD.getTime() > toD.getTime()) {
        toast.warning(t('orders.advFilter.dateInvalidBody'));
        return;
      }
    }
    onApply(normalizeForApply(merged));
    onClose();
  }, [draft, issueUi, onApply, onClose, t]);

  const pickerOpts = useMemo(() => {
    if (picker === 'status') {
      return STATUS_OPTS;
    }
    if (picker === 'payment') {
      return PAYMENT_OPTS;
    }
    if (picker === 'issue') {
      return issueOptionsForPicker;
    }
    return [];
  }, [picker, issueOptionsForPicker]);

  const pickerTitle =
    picker === 'status'
      ? t('orders.advFilter.pickerStatus')
      : picker === 'payment'
      ? t('orders.advFilter.pickerPayment')
      : picker === 'issue'
      ? t('orders.advFilter.pickerIssue')
      : '';

  const paymentPickerValue = useMemo(() => {
    const p = draft.filterPaymentStatus ?? '';
    if (p === 'partial' || p === 'partially_paid') {
      return 'partial_paid';
    }
    return p;
  }, [draft.filterPaymentStatus]);

  const pickerValue =
    picker === 'status'
      ? draft.filterStatus ?? ''
      : picker === 'payment'
      ? paymentPickerValue
      : picker === 'issue'
      ? issueUi
      : '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
    >
      <FilterSheetHostProvider value>
        <View style={st.root}>
          <Pressable
            style={st.backdropFill}
            onPress={onClose}
            accessibilityLabel={t('orders.advFilter.closeOverlayA11y')}
          />
          <View
            style={[
              st.sheet,
              {
                maxHeight: sheetLayout.SHEET_MAX_H,
                width: sheetLayout.SHEET_W,
                marginBottom: Math.max(insets.bottom, 12),
                paddingTop: Platform.OS === 'ios' ? 10 : 8,
              },
            ]}
          >
            <View style={st.header}>
              <View style={st.headerTextCol}>
                <View style={st.headerTitleRow}>
                  <View style={st.headerIconSlot}>
                    <SystemIcon name="funnel" size={22} color={palette.teal} />
                  </View>
                  <View style={st.headerTitles}>
                    <Text style={st.headerTitle}>
                      {t('orders.advFilter.title')}
                    </Text>
                    {scopeHint?.trim() ? (
                      <Text style={st.headerScope} numberOfLines={2}>
                        {scopeHint.trim()}
                      </Text>
                    ) : null}
                    <Text style={st.headerSub} numberOfLines={2}>
                      {t('orders.advFilter.subtitle')}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel={t('orders.advFilter.closeA11y')}
              >
                <SystemIcon name="close" size={24} color={palette.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              style={[st.scroll, { maxHeight: sheetLayout.SCROLL_MAX_H }]}
              contentContainerStyle={st.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={st.activeBar}>
                <View style={st.activeBarIcon}>
                  <SystemIcon name="info" size={16} color={palette.teal} />
                </View>
                <Text style={st.activeBarTxt}>
                  {activeCount === 0
                    ? t('orders.advFilter.activeNone')
                    : t('orders.advFilter.activeSome', { count: activeCount })}
                </Text>
              </View>

              <View style={st.section}>
                <SectionHeader
                  icon="clipboard"
                  title={t('orders.advFilter.sectionMainTitle')}
                  subtitle={t('orders.advFilter.sectionMainSub')}
                />
                <View style={st.fieldStack}>
                  <FilterSelectField
                    icon="clipboard"
                    label={t('orders.advFilter.fieldStatus')}
                    valueLabel={statusLabel}
                    onPress={() => {
                      setDatePicker(null);
                      setPicker('status');
                    }}
                  />
                  <FilterSelectField
                    icon="card"
                    label={t('orders.advFilter.fieldPayment')}
                    valueLabel={paymentLabel}
                    onPress={() => {
                      setDatePicker(null);
                      setPicker('payment');
                    }}
                  />
                  <FilterSelectField
                    icon="warning"
                    label={t('orders.advFilter.fieldIssue')}
                    valueLabel={issueLabel}
                    onPress={() => {
                      setDatePicker(null);
                      setPicker('issue');
                    }}
                  />
                </View>
              </View>

              <View style={st.section}>
                <SectionHeader
                  icon="calendar"
                  title={t('orders.advFilter.sectionDateTitle')}
                  subtitle={t('orders.advFilter.sectionDateSub')}
                />
                <View style={st.dateRow}>
                  <View style={st.dateCell}>
                    <FilterModalDateField
                      label={t('dashboard.customRange.from')}
                      value={fromDate}
                      wrapStyle={st.dateFieldWrap}
                      onPress={() => openDatePicker('from')}
                      onClear={() =>
                        setDraft(prev => {
                          const next = { ...prev };
                          delete next.filterDateFrom;
                          return next;
                        })
                      }
                    />
                  </View>
                  <View style={st.dateCell}>
                    <FilterModalDateField
                      label={t('dashboard.customRange.to')}
                      value={toDate}
                      wrapStyle={st.dateFieldWrap}
                      onPress={() => openDatePicker('to')}
                      onClear={() =>
                        setDraft(prev => {
                          const next = { ...prev };
                          delete next.filterDateTo;
                          return next;
                        })
                      }
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={st.footer}>
              <Pressable
                onPress={resetDraft}
                style={st.resetBtn}
                accessibilityRole="button"
                accessibilityLabel={t('orders.advFilter.resetA11y')}
              >
                <SystemIcon name="refresh" size={18} color={palette.teal} />
                <Text style={st.resetBtnTxt}>
                  {t('orders.advFilter.reset')}
                </Text>
              </Pressable>
              <View style={st.footerActions}>
                <Pressable onPress={onClose} style={st.cancelBtn} hitSlop={6}>
                  <Text style={st.cancelBtnTxt}>{t('common.cancel')}</Text>
                </Pressable>
                <Button
                  variant="primary"
                  size="md"
                  onPress={apply}
                  style={st.applyBtn}
                >
                  <View style={st.applyInner}>
                    <SystemIcon name="check" size={18} color="#ffffff" />
                    <Text style={st.applyTxt}>
                      {t('orders.advFilter.apply')}
                    </Text>
                  </View>
                </Button>
              </View>
            </View>
          </View>

          <OptionsModal
            visible={picker != null}
            title={pickerTitle}
            options={pickerOpts}
            selectedValue={pickerValue}
            t={t}
            onSelect={v => {
              if (picker === 'status') {
                setDraft(prev => ({
                  ...prev,
                  filterStatus: v.trim() ? v : undefined,
                }));
              } else if (picker === 'payment') {
                const pv = v.trim();
                setDraft(prev => ({
                  ...prev,
                  filterPaymentStatus: pv ? pv : undefined,
                }));
              } else if (picker === 'issue') {
                const iv = (v as IssueOptValue) || '';
                setIssueUi(iv);
                setDraft(prev => {
                  const next = { ...prev };
                  const hi = issueFromUi(iv);
                  if (hi === undefined) {
                    delete next.filterHasIssue;
                  } else {
                    next.filterHasIssue = hi;
                  }
                  return next;
                });
              }
            }}
            onClose={() => setPicker(null)}
          />

          <FilterModalDateSheet
            visible={datePicker != null}
            title={
              datePicker === 'from'
                ? t('dashboard.customRange.from')
                : t('dashboard.customRange.to')
            }
            draft={dateDraft}
            minimumDate={datePicker === 'to' ? (fromDate ?? undefined) : undefined}
            maximumDate={datePicker === 'from' ? (toDate ?? undefined) : undefined}
            onDraftChange={setDateDraft}
            onCommit={commitDatePicker}
            onClose={closeDatePicker}
          />
        </View>
      </FilterSheetHostProvider>
    </Modal>
  );
}

function createSelectFieldStyles(c: AppColorPalette) {
  return StyleSheet.create({
    outline: {
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: c.borderMid,
      backgroundColor: c.bgInput,
      paddingHorizontal: 14,
      paddingTop: 16,
      paddingBottom: 12,
      minHeight: 60,
    },
    labCut: {
      position: 'absolute',
      left: 12,
      top: -10,
      paddingHorizontal: 5,
      zIndex: 2,
    },
    labTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.tealLight,
      letterSpacing: 0.2,
    },
    rowMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 4,
    },
    icoBox: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.drawerBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    val: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
      lineHeight: 21,
    },
  });
}

function createSectionHeaderStyles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 14,
    },
    icoCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgButton,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    textCol: { flex: 1, minWidth: 0 },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: 0.2,
    },
    sub: {
      marginTop: 5,
      fontSize: 12.5,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 18,
    },
  });
}

function createOptionsModalStyles(c: AppColorPalette) {
  return StyleSheet.create({
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 8,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      paddingHorizontal: 16,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    optRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      gap: 12,
    },
    optRowOn: { backgroundColor: c.drawerActiveBg },
    optTxt: { flex: 1, fontSize: 15, fontWeight: '600', color: c.textPrimary },
    optTxtOn: { color: c.teal },
  });
}

function createModalStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 10,
      position: 'relative',
    },
    backdropFill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.bgOverlay,
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.borderMid,
      overflow: 'hidden',
      zIndex: 2,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.bgCard,
    },
    headerTextCol: { flex: 1, minWidth: 0, paddingRight: 8 },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    headerIconSlot: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.bgButton,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitles: { flex: 1, minWidth: 0 },
    headerTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: c.textPrimary,
      letterSpacing: 0.2,
    },
    headerScope: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '800',
      color: c.teal,
      lineHeight: 19,
    },
    headerSub: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 19,
    },
    scroll: {
      flexGrow: 0,
    },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 18,
    },
    activeBar: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 14,
      borderRadius: 14,
      backgroundColor: c.drawerActiveBg,
      borderWidth: 1,
      borderColor: c.drawerBorder,
    },
    activeBarIcon: {
      marginTop: 2,
    },
    activeBarTxt: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 19,
    },
    section: {
      marginBottom: 14,
      padding: 14,
      borderRadius: 16,
      backgroundColor: c.bgRow,
      borderWidth: 1,
      borderColor: c.borderMid,
    },
    fieldStack: {
      gap: 12,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    dateCell: {
      flex: 1,
      minWidth: 0,
    },
    dateFieldWrap: {
      marginBottom: 0,
    },
    footer: {
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.bgLayer3,
      gap: 12,
    },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.borderMid,
      backgroundColor: c.bgCard,
    },
    resetBtnTxt: {
      fontSize: 14,
      fontWeight: '800',
      color: c.teal,
    },
    footerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    },
    cancelBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    cancelBtnTxt: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textSecondary,
    },
    applyBtn: { minWidth: 140, paddingHorizontal: 16 },
    applyInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    applyTxt: {
      fontSize: 15,
      fontWeight: '800',
      color: '#ffffff',
    },
  });
}

