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
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import {
  FilterSheetHostProvider,
  FilterSheetOverlay,
} from '@shared/components/ui/filterSheetHost';
import { TextField } from '@shared/components/ui/TextField';
import { FormDatePickerField } from '../../../category/priceList/components/FormDatePickerField';
import {
  dateToIsoDateOnly,
  isoDateOnlyToLocalDate,
} from '../../../category/priceList/components/datePickerUtils';
import {
  PAYMENT_KIND_FILTER_OPTIONS,
  PAYMENT_METHOD_FILTER_OPTIONS,
  PAYMENT_STATUS_FILTER_OPTIONS,
} from '../paymentListFilterOptions';
import type {
  PaymentListFilter,
  PaymentListKindFilter,
  PaymentListMethodFilter,
} from '../paymentListTypes';

const HEADER_FOOTER_EST = 220;

export type PaymentsAdvancedFilterApply = {
  method: PaymentListMethodFilter;
  kind: PaymentListKindFilter;
  status: PaymentListFilter;
  dateFrom: string;
  dateTo: string;
  amountFrom: string;
  amountTo: string;
};

export type PaymentsAdvancedFilterModalProps = {
  visible: boolean;
  methodFilter: PaymentListMethodFilter;
  kindFilter: PaymentListKindFilter;
  statusFilter: PaymentListFilter;
  dateFrom: string;
  dateTo: string;
  amountFrom: string;
  amountTo: string;
  onClose: () => void;
  onApply: (next: PaymentsAdvancedFilterApply) => void;
};

type SelectOpt = { label: string; value: string };

function toSelectOpts<T extends string>(
  rows: { key: T; label: string }[],
): SelectOpt[] {
  return rows.map(r => ({ label: r.label, value: r.key }));
}

function labelForKey<T extends string>(
  rows: { key: T; label: string }[],
  key: T,
): string {
  return rows.find(r => r.key === key)?.label ?? '—';
}

function countActive(d: PaymentsAdvancedFilterApply): number {
  let n = 0;
  if (d.method !== 'all') {
    n += 1;
  }
  if (d.kind !== 'all') {
    n += 1;
  }
  if (d.status !== 'all') {
    n += 1;
  }
  if (d.dateFrom.trim()) {
    n += 1;
  }
  if (d.dateTo.trim()) {
    n += 1;
  }
  if (d.amountFrom.replace(/\D/g, '').length > 0) {
    n += 1;
  }
  if (d.amountTo.replace(/\D/g, '').length > 0) {
    n += 1;
  }
  return n;
}

function FilterSelectField({
  label,
  valueLabel,
  onPress,
  icon,
  containerStyle,
}: {
  label: string;
  valueLabel: string;
  onPress: () => void;
  icon: SystemIconName;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const palette = useAppColors();
  const st = useThemeStyleSheet(createSelectFieldStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[st.outline, containerStyle]}
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
        keyExtractor={item => item.value}
        style={{ maxHeight: winH * 0.5 }}
        keyboardShouldPersistTaps="handled"
        renderItem={renderItem}
      />
    </FilterSheetOverlay>
  );
}

const emptyApply: PaymentsAdvancedFilterApply = {
  method: 'all',
  kind: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  amountFrom: '',
  amountTo: '',
};

export function PaymentsAdvancedFilterModal({
  visible,
  methodFilter,
  kindFilter,
  statusFilter,
  dateFrom: appliedDateFrom,
  dateTo: appliedDateTo,
  amountFrom: appliedAmountFrom,
  amountTo: appliedAmountTo,
  onClose,
  onApply,
}: PaymentsAdvancedFilterModalProps) {
  const palette = useAppColors();
  const st = useThemeStyleSheet(createModalStyles);
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const sheetLayout = useMemo(() => {
    const SHEET_MAX_H = Math.min(winH * 0.92, 820);
    const SHEET_W = Math.min(winW - 16, 560);
    const SCROLL_MAX_H = Math.max(260, SHEET_MAX_H - HEADER_FOOTER_EST);
    return { SHEET_MAX_H, SHEET_W, SCROLL_MAX_H };
  }, [winW, winH]);

  const [draft, setDraft] = useState<PaymentsAdvancedFilterApply>(() => ({
    method: methodFilter,
    kind: kindFilter,
    status: statusFilter,
    dateFrom: appliedDateFrom,
    dateTo: appliedDateTo,
    amountFrom: appliedAmountFrom,
    amountTo: appliedAmountTo,
  }));
  const [picker, setPicker] = useState<null | 'method' | 'kind' | 'status'>(
    null,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraft({
      method: methodFilter,
      kind: kindFilter,
      status: statusFilter,
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo,
      amountFrom: appliedAmountFrom,
      amountTo: appliedAmountTo,
    });
    setPicker(null);
  }, [
    visible,
    methodFilter,
    kindFilter,
    statusFilter,
    appliedDateFrom,
    appliedDateTo,
    appliedAmountFrom,
    appliedAmountTo,
  ]);

  const methodOpts = useMemo(
    () => toSelectOpts(PAYMENT_METHOD_FILTER_OPTIONS),
    [],
  );
  const kindOpts = useMemo(() => toSelectOpts(PAYMENT_KIND_FILTER_OPTIONS), []);
  const statusOpts = useMemo(
    () => toSelectOpts(PAYMENT_STATUS_FILTER_OPTIONS),
    [],
  );

  const methodLabel = useMemo(
    () => labelForKey(PAYMENT_METHOD_FILTER_OPTIONS, draft.method),
    [draft.method],
  );
  const kindLabel = useMemo(
    () => labelForKey(PAYMENT_KIND_FILTER_OPTIONS, draft.kind),
    [draft.kind],
  );
  const statusLabel = useMemo(
    () => labelForKey(PAYMENT_STATUS_FILTER_OPTIONS, draft.status),
    [draft.status],
  );

  const fromDate = useMemo(
    () => isoDateOnlyToLocalDate(draft.dateFrom.trim() || null),
    [draft.dateFrom],
  );
  const toDate = useMemo(
    () => isoDateOnlyToLocalDate(draft.dateTo.trim() || null),
    [draft.dateTo],
  );

  const activeCount = useMemo(() => countActive(draft), [draft]);

  const resetDraft = useCallback(() => {
    setDraft({ ...emptyApply });
  }, []);

  const apply = useCallback(() => {
    const fromS = draft.dateFrom.trim();
    const toS = draft.dateTo.trim();
    if (fromS && !/^\d{4}-\d{2}-\d{2}$/.test(fromS)) {
      toast.warning('Chọn “Từ ngày” bằng lịch hoặc để trống.');
      return;
    }
    if (toS && !/^\d{4}-\d{2}-\d{2}$/.test(toS)) {
      toast.warning('Chọn “Đến ngày” bằng lịch hoặc để trống.');
      return;
    }
    if (fromS && toS) {
      const fd = isoDateOnlyToLocalDate(fromS);
      const td = isoDateOnlyToLocalDate(toS);
      if (fd && td && fd.getTime() > td.getTime()) {
        toast.warning('“Từ ngày” phải trước hoặc bằng “Đến ngày”.');
        return;
      }
    }
    const rawMin = draft.amountFrom.replace(/\D/g, '');
    const rawMax = draft.amountTo.replace(/\D/g, '');
    if (rawMin && rawMax) {
      const nMin = Number(rawMin);
      const nMax = Number(rawMax);
      if (Number.isFinite(nMin) && Number.isFinite(nMax) && nMin > nMax) {
        toast.warning('“Số tiền từ” phải nhỏ hơn hoặc bằng “Số tiền đến”.');
        return;
      }
    }
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  const pickerOpts = useMemo(() => {
    if (picker === 'method') {
      return methodOpts;
    }
    if (picker === 'kind') {
      return kindOpts;
    }
    if (picker === 'status') {
      return statusOpts;
    }
    return [];
  }, [picker, methodOpts, kindOpts, statusOpts]);

  const pickerTitle =
    picker === 'method'
      ? 'Phương thức thanh toán'
      : picker === 'kind'
      ? 'Loại'
      : picker === 'status'
      ? 'Trạng thái'
      : '';

  const pickerValue =
    picker === 'method'
      ? draft.method
      : picker === 'kind'
      ? draft.kind
      : picker === 'status'
      ? draft.status
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
                      Phương thức, loại, trạng thái, khoảng ngày và số tiền.
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
                    ? 'Chưa chọn điều kiện. Điền ô bên dưới rồi bấm Áp dụng.'
                    : `Đang chọn ${activeCount} điều kiện — bấm Áp dụng để tải lại danh sách.`}
                </Text>
              </View>

              <View style={st.section}>
                <View style={st.gridRow}>
                  <View style={st.gridCell}>
                    <FilterSelectField
                      icon="wallet"
                      label="Phương thức thanh toán"
                      valueLabel={methodLabel}
                      onPress={() => setPicker('method')}
                      containerStyle={st.gridField}
                    />
                  </View>
                  <View style={st.gridCell}>
                    <FilterSelectField
                      icon="compare"
                      label="Loại"
                      valueLabel={kindLabel}
                      onPress={() => setPicker('kind')}
                      containerStyle={st.gridField}
                    />
                  </View>
                </View>

                <View style={st.gridRow}>
                  <View style={st.gridCell}>
                    <FilterSelectField
                      icon="clipboard"
                      label="Trạng thái"
                      valueLabel={statusLabel}
                      onPress={() => setPicker('status')}
                      containerStyle={st.gridField}
                    />
                  </View>
                  <View style={st.gridCell}>
                    <FormDatePickerField
                      label="Từ ngày"
                      value={fromDate}
                      wrapStyle={[st.dateFieldWrap, st.gridField]}
                      maximumDate={toDate ?? undefined}
                      onChange={d =>
                        setDraft(prev => ({
                          ...prev,
                          dateFrom: d ? dateToIsoDateOnly(d) : '',
                        }))
                      }
                    />
                  </View>
                </View>

                <View style={st.gridRow}>
                  <View style={st.gridCell}>
                    <FormDatePickerField
                      label="Đến ngày"
                      value={toDate}
                      wrapStyle={[st.dateFieldWrap, st.gridField]}
                      minimumDate={fromDate ?? undefined}
                      onChange={d =>
                        setDraft(prev => ({
                          ...prev,
                          dateTo: d ? dateToIsoDateOnly(d) : '',
                        }))
                      }
                    />
                  </View>
                  <View style={st.gridCell}>
                    <TextField
                      label="Số tiền từ"
                      variant="dark"
                      size="sm"
                      value={draft.amountFrom}
                      onChangeText={t =>
                        setDraft(prev => ({ ...prev, amountFrom: t }))
                      }
                      placeholder="0"
                      keyboardType="numeric"
                      containerStyle={st.amountField}
                    />
                  </View>
                </View>

                <View style={st.gridRow}>
                  <View style={st.gridCell}>
                    <TextField
                      label="Số tiền đến"
                      variant="dark"
                      size="sm"
                      value={draft.amountTo}
                      onChangeText={t =>
                        setDraft(prev => ({ ...prev, amountTo: t }))
                      }
                      placeholder="0"
                      keyboardType="numeric"
                      containerStyle={st.amountField}
                    />
                  </View>
                  <View style={st.gridCell} />
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
              if (picker === 'method') {
                setDraft(prev => ({
                  ...prev,
                  method: v as PaymentListMethodFilter,
                }));
              } else if (picker === 'kind') {
                setDraft(prev => ({
                  ...prev,
                  kind: v as PaymentListKindFilter,
                }));
              } else if (picker === 'status') {
                setDraft(prev => ({
                  ...prev,
                  status: v as PaymentListFilter,
                }));
              }
            }}
            onClose={() => setPicker(null)}
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
      paddingHorizontal: 12,
      paddingTop: 14,
      paddingBottom: 10,
      minHeight: 56,
      flexGrow: 1,
    },
    labCut: {
      position: 'absolute',
      left: 10,
      top: -9,
      paddingHorizontal: 4,
      zIndex: 2,
    },
    labTxt: {
      fontSize: 10,
      fontWeight: '800',
      color: c.tealLight,
      letterSpacing: 0.15,
    },
    rowMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
    },
    icoBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.drawerBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    val: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
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
      padding: 12,
      borderRadius: 16,
      backgroundColor: c.bgRow,
      borderWidth: 1,
      borderColor: c.borderMid,
    },
    gridRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 10,
      marginBottom: 10,
    },
    gridCell: {
      flex: 1,
      minWidth: 0,
    },
    gridField: {
      flex: 1,
      alignSelf: 'stretch',
    },
    dateFieldWrap: {
      marginBottom: 0,
    },
    amountField: {
      marginBottom: 0,
      flex: 1,
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

