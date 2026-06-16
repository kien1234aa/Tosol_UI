import React, { useCallback, useEffect, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import type {
  CreateSupplierPayload,
  SupplierApi,
} from '@services/category/supplierApiTypes';
import {
  getSupplier,
  updateSupplier,
} from '@services/category/supplierAPI';
import {
  fetchCategorySuppliers,
  fetchCategorySupplierStats,
} from '@services/category/categorySupplierSlice';

export type EditSupplierScreenProps = {
  supplierId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  onSaved?: () => void;
};

function applyApiToForm(
  s: SupplierApi,
  setters: {
    setName: (v: string) => void;
    setCode: (v: string) => void;
    setEmail: (v: string) => void;
    setPhone: (v: string) => void;
    setContactPerson: (v: string) => void;
    setTaxCode: (v: string) => void;
    setAddress: (v: string) => void;
    setIsActive: (v: boolean) => void;
  },
) {
  setters.setName(s.name ?? '');
  setters.setCode(s.code != null ? String(s.code) : '');
  setters.setEmail(s.email != null ? String(s.email) : '');
  setters.setPhone(s.phone != null ? String(s.phone) : '');
  setters.setContactPerson(s.contact_person != null ? String(s.contact_person) : '');
  setters.setTaxCode(s.tax_code != null ? String(s.tax_code) : '');
  setters.setAddress(s.address != null ? String(s.address) : '');
  setters.setIsActive(Boolean(s.is_active));
}

export function EditSupplierScreen({
  supplierId,
  onOpenDrawer,
  onBack,
  onSaved,
}: EditSupplierScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_EditSupplierScreen_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const sellerId = useAppSelector(s => s.auth.user?.seller?.id ?? null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(
    async (fromRefresh: boolean) => {
      if (!fromRefresh) {
        setLoadError(null);
      }
      try {
        const data = await getSupplier(supplierId);
        applyApiToForm(data, {
          setName, setCode, setEmail, setPhone,
          setContactPerson, setTaxCode, setAddress, setIsActive,
        });
        setLoadError(null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Không tải được nhà cung cấp';
        if (fromRefresh) {
          toast.error(msg);
        } else {
          setLoadError(msg);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supplierId],
  );

  useEffect(() => {
    setLoading(true);
    void load(false);
  }, [supplierId, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load(true);
  }, [load]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.warning('Vui lòng nhập tên nhà cung cấp.');
      return;
    }

    const payload: CreateSupplierPayload = {
      ...(sellerId != null ? { seller_id: sellerId } : {}),
      name: name.trim(),
      code: code.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      contact_person: contactPerson.trim() || null,
      tax_code: taxCode.trim() || null,
      address: address.trim() || null,
      is_active: isActive,
    };

    setSubmitting(true);
    try {
      await updateSupplier(supplierId, payload);
      void dispatch(fetchCategorySuppliers({}));
      void dispatch(fetchCategorySupplierStats());
      toast.success('Nhà cung cấp đã được cập nhật.');
      onSaved?.();
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    supplierId, name, code, email, phone, contactPerson,
    taxCode, address, isActive, sellerId, dispatch, onBack, onSaved,
  ]);

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
            <Pressable onPress={() => void load(false)} style={styles.retryBtn}>
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
            sectionLabel="Nhà cung cấp"
            title="Sửa nhà cung cấp"
            subtitle={name || undefined}
          />

          <View style={styles.refreshRow}>
            <Pressable
              onPress={onRefresh}
              style={styles.refreshBtn}
              hitSlop={12}
              disabled={refreshing || submitting}
              accessibilityLabel="Tải lại"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={palette.teal} />
              ) : (
                <SystemIcon name="refresh" size={18} color={palette.teal} />
              )}
            </Pressable>
          </View>

          <DetailCard title="Thông tin chung" icon="package">
            <TextField
              label="Tên nhà cung cấp *"
              variant="dark"
              value={name}
              onChangeText={setName}
              placeholder="Tên nhà cung cấp"
            />

            <TextField
              label="Mã nhà cung cấp"
              variant="dark"
              value={code}
              onChangeText={setCode}
              placeholder="VD: SUP-001"
              autoCapitalize="characters"
            />
            <Text style={styles.fieldHint}>{'Tùy chọn — mã định danh nội bộ'}</Text>
          </DetailCard>

          <DetailCard title="Thông tin liên hệ" icon="phone">
            <View style={styles.halfRow}>
              <View style={styles.half}>
                <TextField
                  label="Email"
                  variant="dark"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.half}>
                <TextField
                  label="Điện thoại"
                  variant="dark"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="0901 234 567"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.halfRow}>
              <View style={styles.half}>
                <TextField
                  label="Người liên hệ"
                  variant="dark"
                  value={contactPerson}
                  onChangeText={setContactPerson}
                  placeholder="Họ tên"
                />
              </View>
              <View style={styles.half}>
                <TextField
                  label="Mã số thuế"
                  variant="dark"
                  value={taxCode}
                  onChangeText={setTaxCode}
                  placeholder="0123456789"
                />
              </View>
            </View>

            <TextField
              label="Địa chỉ"
              variant="dark"
              value={address}
              onChangeText={setAddress}
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
              multiline
            />
          </DetailCard>

          <DetailCard title="Cài đặt" icon="settings">
            <View style={styles.switchRow}>
              <View style={styles.switchLabels}>
                <Text style={styles.switchTitle}>Đang hoạt động</Text>
                <Text style={styles.switchHint}>
                  Nhà cung cấp đang được sử dụng
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

function create_EditSupplierScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    flex: { flex: 1, minHeight: 0 },
    scroll: { flex: 1 },
    refreshRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      marginBottom: 4,
    },
    refreshBtn: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fieldHint: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 4,
      marginBottom: 8,
      lineHeight: 15,
    },
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
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 2,
    },
    switchLabels: {
      flex: 1,
      marginRight: 12,
      minWidth: 0,
    },
    switchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    switchHint: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
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
