import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
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
import type {
  ShipmentListFilters,
  ShipmentPartnerFilterOption,
} from '@services/sales/shipmentAPI';
import { SHIPMENT_STATUS_FILTER_OPTIONS } from '@services/sales/shipmentAPI';

export type ShipmentsFilterBarProps = {
  listFilters: ShipmentListFilters;
  partnerOptions: ShipmentPartnerFilterOption[];
  partnersLoading?: boolean;
  onChangeStatus: (status: string | undefined) => void;
  /** Mã đối tác API (`best-express`, `ghn`) — `undefined` = tất cả. */
  onChangePartner: (partnerCode: string | undefined) => void;
};

type StrOpt = { label: string; value: string };

function statusLabelFromValue(v: string | undefined): string {
  const s = v?.trim() ?? '';
  const allLabel =
    SHIPMENT_STATUS_FILTER_OPTIONS[0]?.label ?? 'Tất cả trạng thái';
  const hit = SHIPMENT_STATUS_FILTER_OPTIONS.find(o => o.value === s);
  return hit?.label ?? (s || allLabel);
}

function OptionsSheet({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: StrOpt[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const st = useThemeStyleSheet(createSheetStyles);

  const renderItem = useCallback(
    ({ item }: { item: StrOpt }) => {
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={st.backdrop} onPress={onClose}>
        <Pressable
          style={[st.sheet, { paddingBottom: insets.bottom + 12 }]}
          onPress={e => e.stopPropagation()}
        >
          <Text style={st.sheetTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={item => item.value || '__all__'}
            style={{ maxHeight: winH * 0.45 }}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FilterChip({
  valueText,
  onPress,
  loading,
  accessibilityLabel,
}: {
  valueText: string;
  onPress: () => void;
  loading?: boolean;
  accessibilityLabel: string;
}) {
  const palette = useAppColors();
  const st = useThemeStyleSheet(createChipStyles);
  return (
    <Pressable
      onPress={onPress}
      style={st.chip}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={loading}
    >
      <Text style={st.chipVal} numberOfLines={1}>
        {loading ? 'Đang tải…' : valueText}
      </Text>
      <SystemIcon name="chevronDown" size={18} color={palette.textMuted} />
    </Pressable>
  );
}

function parsePartnerCodeFromSheetValue(v: string): string | undefined {
  const t = v.trim();
  if (!t) {
    return undefined;
  }
  if (t.startsWith('code:')) {
    const c = t.slice(5).trim().toLowerCase();
    return c || undefined;
  }
  return undefined;
}

export function ShipmentsFilterBar({
  listFilters,
  partnerOptions,
  partnersLoading,
  onChangeStatus,
  onChangePartner,
}: ShipmentsFilterBarProps) {
  const st = useThemeStyleSheet(createBarStyles);

  const [open, setOpen] = useState<null | 'status' | 'partner'>(null);

  const statusValue = listFilters.filterStatus?.trim() ?? '';
  const statusDisplay = statusLabelFromValue(listFilters.filterStatus);

  const partnerCode =
    listFilters.filterShippingPartnerCode?.trim().toLowerCase() ?? '';

  const partnerDisplay = useMemo(() => {
    if (!partnerCode) {
      return 'Tất cả đối tác';
    }
    const hit = partnerOptions.find(
      o => o.partnerCode.toLowerCase() === partnerCode,
    );
    return hit?.label ?? formatCodeFallback(partnerCode);
  }, [partnerCode, partnerOptions]);

  const partnerStrOptions: StrOpt[] = useMemo(() => {
    const base: StrOpt[] = [{ label: 'Tất cả đối tác', value: '' }];
    return base.concat(
      partnerOptions.map(p => ({ label: p.label, value: p.key })),
    );
  }, [partnerOptions]);

  const partnerSelectedStr = useMemo(() => {
    if (!partnerCode) {
      return '';
    }
    const hit = partnerOptions.find(
      o => o.partnerCode.toLowerCase() === partnerCode,
    );
    return hit?.key ?? `code:${partnerCode}`;
  }, [partnerCode, partnerOptions]);

  const onPickStatus = useCallback(
    (v: string) => {
      onChangeStatus(v.trim() ? v : undefined);
    },
    [onChangeStatus],
  );

  const onPickPartner = useCallback(
    (v: string) => {
      if (!v.trim()) {
        onChangePartner(undefined);
        return;
      }
      onChangePartner(parsePartnerCodeFromSheetValue(v));
    },
    [onChangePartner],
  );

  return (
    <>
      <View style={st.row}>
        <View style={st.cell}>
          <FilterChip
            valueText={statusDisplay}
            onPress={() => setOpen('status')}
            accessibilityLabel={`Trạng thái: ${statusDisplay}`}
          />
        </View>
        <View style={st.cell}>
          <FilterChip
            valueText={partnerDisplay}
            onPress={() => setOpen('partner')}
            loading={partnersLoading && partnerOptions.length === 0}
            accessibilityLabel={`Đối tác vận chuyển: ${partnerDisplay}`}
          />
        </View>
      </View>

      <OptionsSheet
        visible={open === 'status'}
        title="Trạng thái vận đơn"
        options={SHIPMENT_STATUS_FILTER_OPTIONS}
        selectedValue={statusValue}
        onSelect={onPickStatus}
        onClose={() => setOpen(null)}
      />
      <OptionsSheet
        visible={open === 'partner'}
        title="Đối tác vận chuyển"
        options={partnerStrOptions}
        selectedValue={partnerSelectedStr}
        onSelect={onPickPartner}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

function formatCodeFallback(code: string): string {
  return code
    .split(/[-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function createBarStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    cell: {
      flex: 1,
      minWidth: 0,
    },
  });
}

function createChipStyles(c: AppColorPalette) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.borderMid,
      backgroundColor: c.bgInput,
    },
    chipVal: {
      flex: 1,
      minWidth: 0,
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
    },
  });
}

function createSheetStyles(c: AppColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'flex-end',
    },
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
    optRowOn: { backgroundColor: 'rgba(45,212,191,0.08)' },
    optTxt: { flex: 1, fontSize: 15, fontWeight: '600', color: c.textPrimary },
    optTxtOn: { color: c.teal },
  });
}
