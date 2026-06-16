import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../../app/hooks';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  getBestExpressDistricts,
  getBestExpressProvinces,
  getBestExpressWards,
} from '@services/sales/locationAPI';
import type {
  BestExpressDistrict,
  BestExpressProvince,
  BestExpressWard,
} from '@services/sales/locationApiTypes';
import {
  labelFromCustomerLocationField,
  inferLocationLabelsFromFullAddress,
} from '@services/category/customerApiTypes';
import type { CustomerDetailApi } from '@services/category/customerApiTypes';
import {
  getCustomer,
  updateCustomer,
} from '@services/category/customerAPI';
import { fetchCustomerList } from '@services/category/customerListSlice';

export type EditCustomerScreenProps = {
  customerId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  onSaved?: () => void;
};

type SelectOption<T> = { value: T; label: string };

const modalSelectItemFill = { flex: 1 } as const;

function buildAddressForApi(
  street: string,
  ward: string,
  district: string,
  province: string,
): string {
  return [street.trim(), ward.trim(), district.trim(), province.trim()]
    .filter(s => s.length > 0)
    .join(', ');
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/^(tp\.|tỉnh|thành phố|thành phố|quận|huyện|phường|xã|thị trấn|thị xã)\s+/i, '')
    .trim();
}

function ModalSelect<T extends string | number>({
  label,
  required,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  modalTitle,
}: {
  label: string;
  required?: boolean;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  disabled?: boolean;
  modalTitle: string;
}) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const fs = useThemeStyleSheet(createModalSelectStyles);
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const display = selected?.label ?? placeholder ?? 'Chọn…';

  const renderItem = useCallback(
    ({ item }: { item: SelectOption<T> }) => (
      <Pressable
        style={fs.row}
        onPress={() => {
          onChange(item.value);
          setOpen(false);
        }}
      >
        <View style={modalSelectItemFill}>
          <Text style={fs.rowTitle}>{item.label}</Text>
        </View>
        {value === item.value ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [onChange, value, palette.teal, fs.row, fs.rowTitle],
  );

  const keyExtractor = useCallback(
    (item: SelectOption<T>) => String(item.value),
    [],
  );

  return (
    <View style={fs.wrap}>
      <Text style={fs.lab}>
        {label}
        {required ? <Text style={fs.req}> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[fs.field, disabled && fs.fieldDis]}
        disabled={disabled}
      >
        <Text style={[fs.fieldTxt, !selected && fs.fieldPh]} numberOfLines={1}>
          {display}
        </Text>
        <SystemIcon name="chevronDown" size={14} color={palette.textMuted} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={fs.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[fs.sheet, { paddingBottom: insets.bottom + 16 }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={fs.sheetTitle}>{modalTitle}</Text>
            <FlatList
              style={fs.list}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              data={options}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function EditCustomerScreen({
  customerId,
  onOpenDrawer,
  onBack,
  onSaved,
}: EditCustomerScreenProps) {
  const styles = useThemeStyleSheet(create_EditCustomerScreen_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  // Tên ban đầu từ API để auto-match vào dropdown
  const [initProvinceName, setInitProvinceName] = useState('');
  const [initDistrictName, setInitDistrictName] = useState('');
  const [initWardName, setInitWardName] = useState('');

  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);

  const [provinces, setProvinces] = useState<BestExpressProvince[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesError, setProvincesError] = useState<string | null>(null);

  const [districts, setDistricts] = useState<BestExpressDistrict[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState<string | null>(null);

  const [wards, setWards] = useState<BestExpressWard[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [wardsError, setWardsError] = useState<string | null>(null);

  // --- Load provinces ---
  useEffect(() => {
    let cancelled = false;
    void getBestExpressProvinces()
      .then(list => { if (!cancelled) { setProvinces(list); } })
      .catch((e: unknown) => {
        if (!cancelled) {
          setProvinces([]);
          setProvincesError(e instanceof Error ? e.message : 'Không tải được tỉnh/thành');
        }
      })
      .finally(() => { if (!cancelled) { setProvincesLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // --- Auto-match province khi danh sách tỉnh load xong HOẶC khi customer data về ---
  useEffect(() => {
    if (provinces.length === 0 || provinceId != null || !initProvinceName) {
      return;
    }
    const label = normalizeForMatch(initProvinceName);
    const match =
      provinces.find(p => normalizeForMatch(p.name) === label) ??
      provinces.find(p => normalizeForMatch(p.name).includes(label)) ??
      provinces.find(p => label.includes(normalizeForMatch(p.name)));
    if (match) {
      setProvinceId(match.id);
    }
  }, [provinces, provinceId, initProvinceName]);

  // --- Load districts khi tỉnh thay đổi ---
  useEffect(() => {
    setDistrictId(null);
    setWardId(null);
    setDistricts([]);
    setWards([]);
    setDistrictsError(null);
    setWardsError(null);

    if (provinceId == null) {
      setDistrictsLoading(false);
      return;
    }
    const province = provinces.find(p => p.id === provinceId);
    if (!province) {
      setDistrictsLoading(false);
      return;
    }
    let cancelled = false;
    setDistrictsLoading(true);
    void getBestExpressDistricts(province.address_id)
      .then(list => { if (!cancelled) { setDistricts(list); } })
      .catch((e: unknown) => {
        if (!cancelled) {
          setDistricts([]);
          setDistrictsError(e instanceof Error ? e.message : 'Không tải được quận/huyện');
        }
      })
      .finally(() => { if (!cancelled) { setDistrictsLoading(false); } });
    return () => { cancelled = true; };
  }, [provinceId, provinces]);

  // --- Auto-match district ---
  useEffect(() => {
    if (districts.length === 0 || districtId != null || !initDistrictName) {
      return;
    }
    const label = normalizeForMatch(initDistrictName);
    const match =
      districts.find(d => normalizeForMatch(d.name) === label) ??
      districts.find(d => normalizeForMatch(d.name).includes(label)) ??
      districts.find(d => label.includes(normalizeForMatch(d.name)));
    if (match) {
      setDistrictId(match.id);
    }
  }, [districts, districtId, initDistrictName]);

  // --- Load wards khi quận thay đổi ---
  useEffect(() => {
    setWardId(null);
    setWards([]);
    setWardsError(null);

    if (districtId == null) {
      setWardsLoading(false);
      return;
    }
    const district = districts.find(d => d.id === districtId);
    if (!district) {
      setWardsLoading(false);
      return;
    }
    let cancelled = false;
    setWardsLoading(true);
    void getBestExpressWards(district.address_id)
      .then(list => { if (!cancelled) { setWards(list); } })
      .catch((e: unknown) => {
        if (!cancelled) {
          setWards([]);
          setWardsError(e instanceof Error ? e.message : 'Không tải được phường/xã');
        }
      })
      .finally(() => { if (!cancelled) { setWardsLoading(false); } });
    return () => { cancelled = true; };
  }, [districtId, districts]);

  // --- Auto-match ward ---
  useEffect(() => {
    if (wards.length === 0 || wardId != null || !initWardName) {
      return;
    }
    const label = normalizeForMatch(initWardName);
    const match =
      wards.find(w => normalizeForMatch(w.name) === label) ??
      wards.find(w => normalizeForMatch(w.name).includes(label)) ??
      wards.find(w => label.includes(normalizeForMatch(w.name)));
    if (match) {
      setWardId(match.id);
    }
  }, [wards, wardId, initWardName]);

  // --- Load customer data ---
  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data: CustomerDetailApi = await getCustomer(customerId, { includeSeller: false });
      setName(data.name ?? '');
      setCustomerName(data.name ?? '');
      setPhone(data.phone != null ? String(data.phone) : '');
      setEmail(data.email != null ? String(data.email) : '');

      let prov = labelFromCustomerLocationField(data.province);
      let dist = labelFromCustomerLocationField(data.district);
      let wrd = labelFromCustomerLocationField(data.ward);

      // streetAddress ban đầu = data.address (chỉ số nhà + đường)
      let street = (data.address ?? '').trim();

      // Fallback: nhiều khách hàng cũ lưu null cho 3 field riêng,
      // parse từ full_address dạng "số nhà, phường, quận, tỉnh"
      if (!prov && !dist && !wrd) {
        const inferred = inferLocationLabelsFromFullAddress(data.full_address ?? '');
        prov = inferred.provinceLabel;
        dist = inferred.districtLabel;
        wrd = inferred.wardLabel;

        // Khi tỉnh/quận/phường được parse từ full_address,
        // chỉ giữ lại phần đầu (không phải 3 phần cuối) làm street
        if (prov || dist || wrd) {
          const parts = (data.full_address ?? '')
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
          const streetParts = parts.slice(0, Math.max(0, parts.length - 3));
          street = streetParts.join(', ');
        }
      }

      setInitProvinceName(prov);
      setInitDistrictName(dist);
      setInitWardName(wrd);

      // Reset IDs so auto-match effects re-run
      setProvinceId(null);
      setDistrictId(null);
      setWardId(null);

      setStreetAddress(street);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Không tải được khách hàng');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    void load();
  }, [load]);

  const provinceName = provinces.find(p => p.id === provinceId)?.name?.trim() ?? '';
  const districtName = districts.find(d => d.id === districtId)?.name?.trim() ?? '';
  const wardName = wards.find(w => w.id === wardId)?.name?.trim() ?? '';

  const addressPayload = useMemo(
    () => buildAddressForApi(streetAddress, wardName, districtName, provinceName),
    [streetAddress, wardName, districtName, provinceName],
  );

  const provinceOptions: SelectOption<number>[] = useMemo(
    () => provinces.map(p => ({ value: p.id, label: p.name })),
    [provinces],
  );
  const districtOptions: SelectOption<number>[] = useMemo(
    () => districts.map(d => ({ value: d.id, label: d.name })),
    [districts],
  );
  const wardOptions: SelectOption<number>[] = useMemo(
    () => wards.map(w => ({ value: w.id, label: w.name })),
    [wards],
  );

  const handleSubmit = useCallback(async () => {
    const n = name.trim();
    const p = phone.trim();
    if (!n) {
      toast.warning('Vui lòng nhập tên khách hàng.');
      return;
    }
    if (!p) {
      toast.warning('Vui lòng nhập số điện thoại.');
      return;
    }

    setSubmitting(true);
    try {
      await updateCustomer(customerId, {
        name: n,
        phone: p,
        email: email.trim(),
        address: addressPayload,
      });
      void dispatch(fetchCustomerList({ page: 1 }));
      toast.success('Khách hàng đã được cập nhật.');
      onSaved?.();
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [customerId, name, phone, email, addressPayload, dispatch, onBack, onSaved]);

  const scrollContent = [
    canvasListScrollContent({ paddingHorizontal: 0 }),
    { paddingBottom: insets.bottom + 28 },
  ];

  if (loading) {
    return (
      <View style={styles.root}>
        <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
        <DetailScreenSkeleton />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.root}>
        <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
        <ScrollView contentContainerStyle={scrollContent}>
          <View style={styles.errBox}>
            <Text style={styles.errTxt}>{loadError}</Text>
            <Pressable onPress={() => void load()} style={styles.retryBtn}>
              <Text style={styles.retryTxt}>Thử lại</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormScreenHeading
            sectionLabel="Khách hàng"
            title="Chỉnh sửa khách hàng"
            subtitle={customerName || undefined}
          />

          <DetailCard title="Thông tin cơ bản" icon="person">
            <View style={styles.halfRow}>
              <View style={styles.half}>
                <TextField
                  label="Tên khách hàng *"
                  variant="dark"
                  value={name}
                  onChangeText={setName}
                  placeholder="Tên khách hàng"
                />
              </View>
              <View style={styles.half}>
                <TextField
                  label="Điện thoại *"
                  variant="dark"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="0901 234 567"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TextField
              label="Email"
              variant="dark"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </DetailCard>

          <DetailCard title="Địa chỉ" icon="location">
            {provincesLoading ? (
              <View style={styles.locLoading}>
                <ActivityIndicator size="small" />
                <Text style={styles.locLoadingTxt}>Đang tải tỉnh/thành…</Text>
              </View>
            ) : (
              <ModalSelect
                label="Tỉnh/Thành phố"
                required
                value={provinceId}
                options={provinceOptions}
                  onChange={id => {
                  // Reset init names on manual change so auto-match won't interfere
                  setInitDistrictName('');
                  setInitWardName('');
                  setProvinceId(id);
                }}
                placeholder={provincesError != null ? 'Lỗi tải danh sách' : 'Chọn tỉnh/thành'}
                disabled={provinces.length === 0 || provincesError != null}
                modalTitle="Tỉnh / Thành phố"
              />
            )}
            {provincesError ? (
              <Text style={styles.fieldErr}>{provincesError}</Text>
            ) : null}

            <View style={styles.halfRow}>
              <View style={styles.half}>
                <ModalSelect
                  label="Quận/Huyện"
                  required
                  value={districtId}
                  options={districtOptions}
                  onChange={id => {
                    setInitWardName('');
                    setDistrictId(id);
                  }}
                  placeholder={
                    provinceId == null
                      ? 'Chọn tỉnh trước'
                      : districtsLoading
                      ? 'Đang tải…'
                      : 'Chọn quận/huyện'
                  }
                  disabled={provinceId == null || districtsLoading}
                  modalTitle="Quận / Huyện"
                />
                {districtsError ? (
                  <Text style={styles.fieldErr}>{districtsError}</Text>
                ) : null}
              </View>
              <View style={styles.half}>
                <ModalSelect
                  label="Phường/Xã"
                  required
                  value={wardId}
                  options={wardOptions}
                  onChange={setWardId}
                  placeholder={
                    districtId == null
                      ? 'Chọn quận trước'
                      : wardsLoading
                      ? 'Đang tải…'
                      : 'Chọn phường/xã'
                  }
                  disabled={districtId == null || wardsLoading}
                  modalTitle="Phường / Xã"
                />
                {wardsError ? (
                  <Text style={styles.fieldErr}>{wardsError}</Text>
                ) : null}
              </View>
            </View>

            <TextField
              label="Địa chỉ"
              variant="dark"
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="Số nhà, đường…"
              multiline
            />
          </DetailCard>

          <View style={styles.footer}>
            <Button
              title="Lưu thay đổi"
              variant="primary"
              loading={submitting}
              onPress={() => void handleSubmit()}
              style={styles.footerPrimary}
            />
            <Button
              title="Hủy"
              variant="outline"
              disabled={submitting}
              onPress={onBack}
              style={styles.footerCancel}
              textStyle={styles.footerCancelText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createModalSelectStyles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 0,
      minWidth: 0,
      alignSelf: 'stretch',
      width: '100%',
    },
    lab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 6,
    },
    req: { color: c.orange },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    fieldDis: { opacity: 0.5 },
    fieldTxt: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    fieldPh: { color: c.textMuted },
    backdrop: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
      maxHeight: '70%',
      borderTopWidth: 1,
      borderColor: c.border,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 12,
    },
    list: { maxHeight: 320 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    rowTitle: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
  });
}

function create_EditCustomerScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    flex: { flex: 1, minHeight: 0 },
    scroll: { flex: 1 },
    halfRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'flex-start',
    },
    half: {
      flex: 1,
      minWidth: 140,
    },
    locLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
    },
    locLoadingTxt: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
    },
    fieldErr: {
      fontSize: 12,
      color: c.red,
      marginTop: 4,
      fontWeight: '600',
    },
    footer: {
      gap: 12,
      marginTop: 8,
      paddingHorizontal: 20,
    },
    footerPrimary: { width: '100%' },
    footerCancel: {
      width: '100%',
      backgroundColor: c.bgButton,
      borderColor: c.border,
    },
    footerCancelText: { color: c.textPrimary },
    errBox: {
      margin: 20,
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 14, fontWeight: '600', color: c.red, marginBottom: 12 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.teal },
  });
}
