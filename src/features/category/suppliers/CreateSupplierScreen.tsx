import React, { useCallback, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { createSupplier } from '@services/category/supplierAPI';
import type { CreateSupplierPayload } from '@services/category/supplierApiTypes';
import {
  fetchCategorySuppliers,
  fetchCategorySupplierStats,
} from '@services/category/categorySupplierSlice';

export type CreateSupplierScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
};

export function CreateSupplierScreen({
  onOpenDrawer,
  onBack,
}: CreateSupplierScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_CreateSupplierScreen_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const sellerId = useAppSelector(s => s.auth.user?.seller?.id ?? null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

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
      const created = await createSupplier(payload);
      void dispatch(fetchCategorySuppliers({ page: 1 }));
      void dispatch(fetchCategorySupplierStats());
      toast.success(`Đã tạo nhà cung cấp ${created.name}`);
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    name, code, email, phone, contactPerson, taxCode, address,
    isActive, sellerId, dispatch, onBack,
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
            sectionLabel="Nhà cung cấp"
            title="Tạo nhà cung cấp"
          />

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
              title="Tạo mới"
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

function create_CreateSupplierScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    flex: { flex: 1, minHeight: 0 },
    scroll: { flex: 1 },
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
  });
}
