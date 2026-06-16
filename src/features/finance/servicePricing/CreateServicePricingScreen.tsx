import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { getCurrencies } from '@services/category/priceListAPI';
import type { CurrencyApi } from '@services/category/priceListApiTypes';
import { CurrencySelect } from '../../category/priceList/components/CurrencySelect';
import { FormDatePickerField } from '../../category/priceList/components/FormDatePickerField';
import { dateToIsoDateOnly } from '../../category/priceList/components/datePickerUtils';
import type { LoginWarehouse } from '@services/auth/loginResponseTypes';
import {
  createServicePricing,
  getServicePricingsPage,
} from '@services/finance/servicePricingAPI';

export type CreateServicePricingScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
  onCreated?: () => void;
};

type OptionItem = { key: string; label: string };

type OptionSelectProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  options: OptionItem[];
  value: string | null;
  onChange: (key: string) => void;
  allowCustom?: boolean;
  customValue?: string;
  onCustomChange?: (v: string) => void;
};

function OptionSelect({
  label,
  required,
  placeholder = 'Chọn…',
  options,
  value,
  onChange,
  allowCustom,
  customValue,
  onCustomChange,
}: OptionSelectProps) {
  const styles = useThemeStyleSheet(createOptionSelectStyles);
  const palette = useAppColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.key === value);
  const display =
    selected?.label ??
    (allowCustom && customValue?.trim() ? customValue.trim() : null) ??
    placeholder;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            styles.triggerTxt,
            !selected && !(allowCustom && customValue?.trim()) && styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {display}
        </Text>
        <SystemIcon name="chevronDown" size={16} color={palette.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={styles.sheetTitle}>{label}</Text>
          {allowCustom ? (
            <TextField
              label="Nhập thủ công"
              variant="dark"
              value={customValue ?? ''}
              onChangeText={v => {
                onCustomChange?.(v);
                if (v.trim()) {
                  onChange(v.trim());
                }
              }}
              placeholder="Nhập giá trị…"
            />
          ) : null}
          <FlatList
            data={options}
            keyExtractor={item => item.key}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onChange(item.key);
                  setOpen(false);
                }}
              >
                <Text style={styles.rowTxt}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

export function CreateServicePricingScreen({
  onOpenDrawer,
  onBack,
  onCreated,
}: CreateServicePricingScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createCreateServicePricingStyles);
  const insets = useSafeAreaInsets();
  const sellerId = useAppSelector(s => s.auth.user?.seller?.id ?? null);
  const warehouses = useAppSelector(
    s => s.auth.user?.warehouses ?? [],
  ) as LoginWarehouse[];

  const [submitting, setSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyApi[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [serviceTypeOptions, setServiceTypeOptions] = useState<OptionItem[]>(
    [],
  );
  const [unitOptions, setUnitOptions] = useState<OptionItem[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [serviceTypeCustom, setServiceTypeCustom] = useState('');
  const [unit, setUnit] = useState<string | null>(null);
  const [unitCustom, setUnitCustom] = useState('');
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [toWarehouseId, setToWarehouseId] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [minQty, setMinQty] = useState('1');
  const [maxQty, setMaxQty] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(null);
  const [effectiveTo, setEffectiveTo] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(true);

  const warehouseOptions = useMemo(
    (): OptionItem[] =>
      warehouses.map(w => ({
        key: String(w.id),
        label: w.name?.trim() || w.code?.trim() || `#${w.id}`,
      })),
    [warehouses],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCurrenciesLoading(true);
      try {
        const [list, pricingPage] = await Promise.all([
          getCurrencies({ page: 1, per_page: 100 }),
          getServicePricingsPage({ page: 1, per_page: 50 }).catch(() => ({
            items: [],
            meta: null,
          })),
        ]);
        if (cancelled) {
          return;
        }
        setCurrencies(list);
        const typeMap = new Map<string, string>();
        const unitMap = new Map<string, string>();
        for (const row of pricingPage.items) {
          const st = row.service_type?.trim();
          if (st) {
            typeMap.set(st, row.service_type_label?.trim() || st);
          }
          const u = row.unit?.trim();
          if (u) {
            unitMap.set(u, row.unit_label?.trim() || u);
          }
        }
        setServiceTypeOptions(
          [...typeMap.entries()].map(([key, label]) => ({ key, label })),
        );
        setUnitOptions(
          [...unitMap.entries()].map(([key, label]) => ({ key, label })),
        );
      } catch {
        if (!cancelled) {
          setCurrencies([]);
        }
      } finally {
        if (!cancelled) {
          setCurrenciesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currencyId != null || currencies.length === 0) {
      return;
    }
    const first = currencies[0];
    if (first) {
      setCurrencyId(first.id);
    }
  }, [currencies, currencyId]);

  const resolvedServiceType =
    serviceType?.trim() || serviceTypeCustom.trim() || '';
  const resolvedUnit = unit?.trim() || unitCustom.trim() || '';

  const handleSubmit = useCallback(async () => {
    const n = name.trim();
    if (!n) {
      toast.warning('Vui lòng nhập tên bảng giá dịch vụ.');
      return;
    }
    if (!resolvedServiceType) {
      toast.warning('Vui lòng chọn hoặc nhập loại dịch vụ.');
      return;
    }
    if (!resolvedUnit) {
      toast.warning('Vui lòng chọn hoặc nhập đơn vị.');
      return;
    }
    if (currencyId == null) {
      toast.warning('Vui lòng chọn loại tiền.');
      return;
    }
    if (sellerId == null) {
      toast.warning('Tài khoản không gắn seller — không xác định được seller_id.');
      return;
    }
    const priceNum = Number(price.replace(/,/g, '').trim());
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.warning('Giá không hợp lệ.');
      return;
    }
    const minNum = Number(minQty.replace(/,/g, '').trim() || '1');
    if (!Number.isFinite(minNum) || minNum < 0) {
      toast.warning('Số lượng tối thiểu không hợp lệ.');
      return;
    }
    const maxRaw = maxQty.replace(/,/g, '').trim();
    const maxNum = maxRaw ? Number(maxRaw) : null;
    if (maxNum != null && (!Number.isFinite(maxNum) || maxNum < minNum)) {
      toast.warning('Số lượng tối đa phải lớn hơn hoặc bằng tối thiểu.');
      return;
    }

    const fromIso = effectiveFrom ? dateToIsoDateOnly(effectiveFrom) : null;
    const toIso = effectiveTo ? dateToIsoDateOnly(effectiveTo) : null;
    if (fromIso && toIso && fromIso > toIso) {
      toast.error('Hiệu lực từ phải trước hoặc bằng Hiệu lực đến.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createServicePricing({
        seller_id: sellerId,
        warehouse_id: warehouseId,
        to_warehouse_id: toWarehouseId,
        currency_id: currencyId,
        service_type: resolvedServiceType,
        name: n,
        description: description.trim() || null,
        price: priceNum,
        unit: resolvedUnit,
        min_quantity: minNum,
        max_quantity: maxNum,
        is_active: isActive,
        effective_from: fromIso,
        effective_to: toIso,
      });
      toast.success(`Đã tạo bảng giá dịch vụ ${created.name}`);
      onCreated?.();
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    name,
    description,
    resolvedServiceType,
    resolvedUnit,
    currencyId,
    sellerId,
    price,
    minQty,
    maxQty,
    warehouseId,
    toWarehouseId,
    isActive,
    effectiveFrom,
    effectiveTo,
    onBack,
    onCreated,
  ]);

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            canvasListScrollContent({ paddingHorizontal: 0 }),
            { paddingBottom: insets.bottom + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormScreenHeading
            sectionLabel="Tài chính"
            title="Tạo bảng giá dịch vụ"
          />

          <DetailCard title="Thông tin cơ bản" icon="wallet">
            <TextField
              label="Tên *"
              variant="dark"
              value={name}
              onChangeText={setName}
              placeholder="VD: Phí lưu kho tháng 3"
            />
            <TextField
              label="Mô tả"
              variant="dark"
              value={description}
              onChangeText={setDescription}
              placeholder="Ghi chú (tuỳ chọn)"
              multiline
            />
            <OptionSelect
              label="Loại dịch vụ"
              required
              options={serviceTypeOptions}
              value={serviceType}
              onChange={setServiceType}
              allowCustom
              customValue={serviceTypeCustom}
              onCustomChange={setServiceTypeCustom}
            />
            <OptionSelect
              label="Đơn vị"
              required
              options={unitOptions}
              value={unit}
              onChange={setUnit}
              allowCustom
              customValue={unitCustom}
              onCustomChange={setUnitCustom}
            />
            <CurrencySelect
              label="Loại tiền *"
              required
              options={currencies}
              valueId={currencyId}
              onChange={setCurrencyId}
              disabled={currenciesLoading || currencies.length === 0}
            />
            <TextField
              label="Giá *"
              variant="dark"
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              keyboardType="numeric"
            />
          </DetailCard>

          <DetailCard title="Phạm vi áp dụng" icon="package">
            {warehouseOptions.length > 0 ? (
              <>
                <OptionSelect
                  label="Kho"
                  placeholder="Tất cả / không chọn"
                  options={[
                    { key: '', label: '— Không chọn —' },
                    ...warehouseOptions,
                  ]}
                  value={warehouseId != null ? String(warehouseId) : ''}
                  onChange={k =>
                    setWarehouseId(k ? Number(k) : null)
                  }
                />
                <OptionSelect
                  label="Kho đích"
                  placeholder="Không chọn"
                  options={[
                    { key: '', label: '— Không chọn —' },
                    ...warehouseOptions,
                  ]}
                  value={toWarehouseId != null ? String(toWarehouseId) : ''}
                  onChange={k =>
                    setToWarehouseId(k ? Number(k) : null)
                  }
                />
              </>
            ) : (
              <Text style={styles.fieldHint}>
                Tài khoản chưa có kho gắn — bỏ qua phạm vi kho.
              </Text>
            )}
            <View style={styles.qtyRow}>
              <View style={styles.qtyHalf}>
                <TextField
                  label="SL tối thiểu"
                  variant="dark"
                  value={minQty}
                  onChangeText={setMinQty}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.qtyHalf}>
                <TextField
                  label="SL tối đa"
                  variant="dark"
                  value={maxQty}
                  onChangeText={setMaxQty}
                  placeholder="Không giới hạn"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </DetailCard>

          <DetailCard title="Thời gian hiệu lực" icon="calendar">
            <View style={styles.dateRow}>
              <View style={styles.dateHalf}>
                <FormDatePickerField
                  label="Hiệu lực từ"
                  value={effectiveFrom}
                  onChange={setEffectiveFrom}
                  maximumDate={effectiveTo ?? undefined}
                />
              </View>
              <View style={styles.dateHalf}>
                <FormDatePickerField
                  label="Hiệu lực đến"
                  value={effectiveTo}
                  onChange={setEffectiveTo}
                  minimumDate={effectiveFrom ?? undefined}
                />
              </View>
            </View>
          </DetailCard>

          <DetailCard title="Cài đặt" icon="settings">
            <View style={[styles.switchRow, styles.switchRowLast]}>
              <View style={styles.switchLabels}>
                <Text style={styles.switchTitle}>Đang hoạt động</Text>
                <Text style={styles.switchHint}>
                  Bảng giá có thể được sử dụng
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: palette.border, true: palette.teal }}
                thumbColor={palette.textPrimary}
              />
            </View>
          </DetailCard>

          <View style={styles.actions}>
            <Button
              title="Hủy"
              variant="secondary"
              onPress={onBack}
              disabled={submitting}
            />
            <Button
              title={submitting ? 'Đang lưu…' : 'Tạo bảng giá'}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createCreateServicePricingStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    scroll: { flex: 1 },
    fieldHint: {
      fontSize: 12,
      color: c.textMuted,
      lineHeight: 17,
      marginBottom: 8,
    },
    qtyRow: { flexDirection: 'row', gap: 12 },
    qtyHalf: { flex: 1, minWidth: 0 },
    dateRow: { flexDirection: 'row', gap: 12 },
    dateHalf: { flex: 1, minWidth: 0 },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    switchRowLast: { borderBottomWidth: 0 },
    switchLabels: { flex: 1, paddingRight: 12 },
    switchTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
    },
    switchHint: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      marginTop: 8,
    },
  });
}

function createOptionSelectStyles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: { marginBottom: 14 },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 6,
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    triggerTxt: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.textPrimary,
      marginRight: 8,
    },
    placeholder: { color: c.textMuted },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      maxHeight: '70%',
      backgroundColor: c.bgModal,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 12,
    },
    row: {
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textPrimary,
    },
  });
}
