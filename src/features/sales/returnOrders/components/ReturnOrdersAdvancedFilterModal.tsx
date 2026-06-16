import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { ReturnOrderListFilters } from '@services/sales/returnOrderAPI';
import { EMPTY_RETURN_ORDER_LIST_FILTERS } from '@services/sales/returnOrderAPI';

export type ReturnOrdersAdvancedFilterModalProps = {
  visible: boolean;
  appliedFilters: ReturnOrderListFilters;
  onClose: () => void;
  onApply: (next: ReturnOrderListFilters) => void;
};

type SelectOpt = { label: string; value: string };

const STATUS_OPTS: SelectOpt[] = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Đang nhận hàng', value: 'receiving' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Từ chối', value: 'rejected' },
  { label: 'Đã hủy', value: 'cancelled' },
];

const TYPE_OPTS: SelectOpt[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Trả toàn bộ', value: 'full' },
  { label: 'Trả một phần', value: 'partial' },
];

const REASON_OPTS: SelectOpt[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Hàng hư hỏng', value: 'damaged' },
  { label: 'Sai sản phẩm', value: 'wrong_product' },
  { label: 'Yêu cầu khách hàng', value: 'customer_request' },
  { label: 'Hàng lỗi', value: 'defective' },
  { label: 'Khác', value: 'other' },
];

const REFUND_OPTS: SelectOpt[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ hoàn tiền', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đã hoàn tiền', value: 'refunded' },
  { label: 'Đã hủy', value: 'cancelled' },
];

const HEADER_FOOTER_EST = 200;

function labelForValue(opts: SelectOpt[], value: string | undefined): string {
  const v = value?.trim() ?? '';
  if (!v) {
    return opts[0]?.label ?? 'Tất cả';
  }
  return opts.find(o => o.value === v)?.label ?? v;
}

function countDraft(d: ReturnOrderListFilters): number {
  let n = 0;
  if (d.filterStatus?.trim()) {
    n += 1;
  }
  if (d.filterReturnType?.trim()) {
    n += 1;
  }
  if (d.filterReason?.trim()) {
    n += 1;
  }
  if (d.filterRefundStatus?.trim()) {
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

function cloneFilters(f: ReturnOrderListFilters): ReturnOrderListFilters {
  return { ...f };
}

function normalizeForApply(d: ReturnOrderListFilters): ReturnOrderListFilters {
  const out: ReturnOrderListFilters = {};
  if (d.filterStatus?.trim()) {
    out.filterStatus = d.filterStatus.trim();
  }
  if (d.filterReturnType?.trim()) {
    out.filterReturnType = d.filterReturnType.trim();
  }
  if (d.filterReason?.trim()) {
    out.filterReason = d.filterReason.trim();
  }
  if (d.filterRefundStatus?.trim()) {
    out.filterRefundStatus = d.filterRefundStatus.trim();
  }
  if (d.filterDateFrom?.trim()) {
    out.filterDateFrom = d.filterDateFrom.trim();
  }
  if (d.filterDateTo?.trim()) {
    out.filterDateTo = d.filterDateTo.trim();
  }
  if (d.filterSearch?.trim()) {
    out.filterSearch = d.filterSearch.trim();
  }
  return out;
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
}: {
  visible: boolean;
  title: string;
  options: SelectOpt[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
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
            {item.label}
          </Text>
          {sel ? (
            <SystemIcon name="check" size={20} color={palette.teal} />
          ) : null}
        </Pressable>
      );
    },
    [selectedValue, onSelect, onClose, st.optRow, st.optRowOn, st.optTxt, st.optTxtOn, palette.teal],
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

export function ReturnOrdersAdvancedFilterModal({
  visible,
  appliedFilters,
  onClose,
  onApply,
}: ReturnOrdersAdvancedFilterModalProps) {
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

  const [draft, setDraft] = useState<ReturnOrderListFilters>(() =>
    cloneFilters(appliedFilters),
  );
  const [picker, setPicker] = useState<
    null | 'status' | 'type' | 'reason' | 'refund'
  >(null);
  const [datePicker, setDatePicker] = useState<'from' | 'to' | null>(null);
  const [dateDraft, setDateDraft] = useState(() => new Date());

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraft(cloneFilters(appliedFilters));
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
    () => labelForValue(STATUS_OPTS, draft.filterStatus),
    [draft.filterStatus],
  );
  const typeLabel = useMemo(
    () => labelForValue(TYPE_OPTS, draft.filterReturnType),
    [draft.filterReturnType],
  );
  const reasonLabel = useMemo(
    () => labelForValue(REASON_OPTS, draft.filterReason),
    [draft.filterReason],
  );
  const refundLabel = useMemo(
    () => labelForValue(REFUND_OPTS, draft.filterRefundStatus),
    [draft.filterRefundStatus],
  );

  const activeCount = useMemo(() => countDraft(draft), [draft]);

  const resetDraft = useCallback(() => {
    setDraft({ ...EMPTY_RETURN_ORDER_LIST_FILTERS });
  }, []);

  const apply = useCallback(() => {
    const fromS = draft.filterDateFrom?.trim();
    const toS = draft.filterDateTo?.trim();
    if (fromS && toS) {
      const fromD = isoDateOnlyToLocalDate(fromS);
      const toD = isoDateOnlyToLocalDate(toS);
      if (fromD && toD && fromD.getTime() > toD.getTime()) {
        toast.warning('“Từ ngày” phải trước hoặc bằng “Đến ngày”.');
        return;
      }
    }
    onApply(normalizeForApply(draft));
    onClose();
  }, [draft, onApply, onClose]);

  const pickerOpts = useMemo(() => {
    if (picker === 'status') {
      return STATUS_OPTS;
    }
    if (picker === 'type') {
      return TYPE_OPTS;
    }
    if (picker === 'reason') {
      return REASON_OPTS;
    }
    if (picker === 'refund') {
      return REFUND_OPTS;
    }
    return [];
  }, [picker]);

  const pickerTitle =
    picker === 'status'
      ? 'Trạng thái'
      : picker === 'type'
      ? 'Loại trả hàng'
      : picker === 'reason'
      ? 'Lý do trả'
      : picker === 'refund'
      ? 'Trạng thái hoàn tiền'
      : '';

  const pickerValue =
    picker === 'status'
      ? draft.filterStatus ?? ''
      : picker === 'type'
      ? draft.filterReturnType ?? ''
      : picker === 'reason'
      ? draft.filterReason ?? ''
      : picker === 'refund'
      ? draft.filterRefundStatus ?? ''
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
            accessibilityLabel="Đóng overlay"
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
                    <Text style={st.headerTitle}>Bộ lọc nâng cao</Text>
                    <Text style={st.headerSub} numberOfLines={2}>
                      Lọc đơn trả hàng theo trạng thái, loại, lý do, hoàn tiền
                      và ngày.
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel="Đóng"
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
                    ? 'Chưa chọn điều kiện. Chạm từng ô bên dưới để thiết lập lọc.'
                    : `Đang chọn ${activeCount} điều kiện — bấm Áp dụng để tải lại danh sách.`}
                </Text>
              </View>

              <View style={st.section}>
                <SectionHeader
                  icon="clipboard"
                  title="Điều kiện lọc"
                  subtitle="Trạng thái đơn trả, loại trả, lý do và trạng thái hoàn tiền."
                />
                <View style={st.fieldStack}>
                  <FilterSelectField
                    icon="clipboard"
                    label="Trạng thái"
                    valueLabel={statusLabel}
                    onPress={() => {
                      setDatePicker(null);
                      setPicker('status');
                    }}
                  />
                  <FilterSelectField
                    icon="compare"
                    label="Loại trả hàng"
                    valueLabel={typeLabel}
                    onPress={() => {
                      setDatePicker(null);
                      setPicker('type');
                    }}
                  />
                  <FilterSelectField
                    icon="warning"
                    label="Lý do trả"
                    valueLabel={reasonLabel}
                    onPress={() => {
                      setDatePicker(null);
                      setPicker('reason');
                    }}
                  />
                  <FilterSelectField
                    icon="cash"
                    label="Trạng thái hoàn tiền"
                    valueLabel={refundLabel}
                    onPress={() => {
                      setDatePicker(null);
                      setPicker('refund');
                    }}
                  />
                </View>
              </View>

              <View style={st.section}>
                <SectionHeader
                  icon="calendar"
                  title="Thời gian"
                  subtitle="Tuỳ chọn — theo ngày tạo / cập nhật đơn trả (YYYY-MM-DD)."
                />
                <View style={st.dateRow}>
                  <View style={st.dateCell}>
                    <FilterModalDateField
                      label="Từ ngày"
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
                      label="Đến ngày"
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
                accessibilityLabel="Đặt lại bộ lọc"
              >
                <SystemIcon name="refresh" size={18} color={palette.teal} />
                <Text style={st.resetBtnTxt}>Đặt lại</Text>
              </Pressable>
              <View style={st.footerActions}>
                <Pressable onPress={onClose} style={st.cancelBtn} hitSlop={6}>
                  <Text style={st.cancelBtnTxt}>Hủy</Text>
                </Pressable>
                <Button
                  variant="primary"
                  size="md"
                  onPress={apply}
                  style={st.applyBtn}
                >
                  <View style={st.applyInner}>
                    <SystemIcon name="check" size={18} color="#ffffff" />
                    <Text style={st.applyTxt}>Áp dụng</Text>
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
            onSelect={v => {
              const trimmed = v.trim();
              if (picker === 'status') {
                setDraft(prev => ({
                  ...prev,
                  filterStatus: trimmed ? trimmed : undefined,
                }));
              } else if (picker === 'type') {
                setDraft(prev => ({
                  ...prev,
                  filterReturnType: trimmed ? trimmed : undefined,
                }));
              } else if (picker === 'reason') {
                setDraft(prev => ({
                  ...prev,
                  filterReason: trimmed ? trimmed : undefined,
                }));
              } else if (picker === 'refund') {
                setDraft(prev => ({
                  ...prev,
                  filterRefundStatus: trimmed ? trimmed : undefined,
                }));
              }
            }}
            onClose={() => setPicker(null)}
          />

          <FilterModalDateSheet
            visible={datePicker != null}
            title={datePicker === 'from' ? 'Từ ngày' : 'Đến ngày'}
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

