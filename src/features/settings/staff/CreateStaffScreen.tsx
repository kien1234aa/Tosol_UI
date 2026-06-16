import React, { useCallback, useMemo, useState } from 'react';
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
import { useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  FormMenuSelect,
  type FormMenuOption,
} from '../shops/components/FormMenuSelect';
import { createStaffUser } from '@services/settings/staffAPI';
import { STAFF_ROLE_REFERENCE_COPY } from './staffRoleReference';

const ROLE_OPTIONS: FormMenuOption<'staff' | 'admin'>[] = [
  { key: 'staff', label: 'Nhân viên (nhà bán)' },
  { key: 'admin', label: 'Quản lý (nhà bán)' },
];

export type CreateStaffScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
  onCreated?: () => void;
};

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export function CreateStaffScreen({
  onOpenDrawer,
  onBack,
  onCreated,
}: CreateStaffScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();

  const sellerId = useAppSelector(s => {
    const fromProfile = s.user.profile?.seller?.id;
    if (typeof fromProfile === 'number' && fromProfile > 0) {
      return fromProfile;
    }
    const fromAuth = s.auth.user?.seller?.id;
    if (typeof fromAuth === 'number' && fromAuth > 0) {
      return fromAuth;
    }
    return null;
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const roleOptions = useMemo(() => ROLE_OPTIONS, []);

  const handleSubmit = useCallback(() => {
    const n = name.trim();
    const e = email.trim();
    const p = password;
    if (!n) {
      toast.warning('Vui lòng nhập họ tên.');
      return;
    }
    if (!e) {
      toast.warning('Vui lòng nhập email.');
      return;
    }
    if (!isValidEmail(e)) {
      toast.warning('Vui lòng kiểm tra định dạng email.');
      return;
    }
    if (p.length < 8) {
      toast.warning('Mật khẩu tối thiểu 8 ký tự.');
      return;
    }
    if (sellerId == null) {
      toast.error('Không xác định được seller (nhà bán). Vui lòng đăng nhập lại hoặc tải lại thông tin tài khoản.');
      return;
    }
    void (async () => {
      setSubmitting(true);
      try {
        await createStaffUser({
          name: n,
          email: e,
          phone: phone.trim(),
          password: p,
          role,
          seller_id: sellerId,
          is_active: isActive,
        });
        toast.success('Đã tạo tài khoản nhân viên thành công.');
        onCreated?.();
        onBack();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [
    name,
    email,
    phone,
    password,
    role,
    isActive,
    sellerId,
    onCreated,
    onBack,
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
            sectionLabel="Quản lý nhân viên"
            title="Thêm nhân viên"
            subtitle="Thêm nhân viên mới vào tổ chức của bạn"
          />

          <DetailCard title="Thông tin người dùng" icon="person">
            <View style={styles.formGap}>
              <TextField
                label="Họ tên *"
                variant="dark"
                value={name}
                onChangeText={setName}
                placeholder="Nguyễn Văn A"
                editable={!submitting}
              />
              <TextField
                label="Email *"
                variant="dark"
                value={email}
                onChangeText={setEmail}
                placeholder="tomonivn@tosol.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!submitting}
                containerStyle={styles.fieldSp}
              />
              <TextField
                label="Số điện thoại"
                variant="dark"
                value={phone}
                onChangeText={setPhone}
                placeholder="0900 000 000"
                keyboardType="phone-pad"
                editable={!submitting}
                containerStyle={styles.fieldSp}
              />
              <TextField
                label="Mật khẩu *"
                variant="dark"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                isPassword
                editable={!submitting}
                containerStyle={styles.fieldSp}
              />
              <Text style={styles.pwHint}>Tối thiểu 8 ký tự</Text>

              <View style={styles.fieldSp}>
                <FormMenuSelect
                  label="Vai trò"
                  sheetTitle="Chọn vai trò"
                  options={roleOptions}
                  value={role}
                  onChange={setRole}
                  disabled={submitting}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchTitle}>Hoạt động</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  disabled={submitting}
                  trackColor={{ false: palette.border, true: palette.greenBg }}
                  thumbColor={isActive ? palette.green : palette.textMuted}
                />
              </View>
            </View>

            <View style={styles.footerRow}>
              <Button
                title="Hủy"
                variant="outline"
                onPress={onBack}
                disabled={submitting}
                style={[styles.footerCancel, styles.footerBtn]}
                textStyle={styles.footerCancelText}
              />
              <Button
                title="+ Thêm Người Dùng"
                variant="primary"
                onPress={handleSubmit}
                disabled={submitting}
                style={styles.footerBtn}
              />
            </View>
          </DetailCard>

          <View style={styles.roleCard}>
            <DetailCard title="Thông tin vai trò" icon="info">
              <View style={styles.divider} />
              <Text style={styles.roleBody}>{STAFF_ROLE_REFERENCE_COPY}</Text>
            </DetailCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1, minHeight: 0 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 14, paddingTop: 12 },
    formGap: {
      gap: 0,
    },
    fieldSp: {
      marginTop: 12,
    },
    pwHint: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
      marginBottom: 4,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    switchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    footerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 16,
      justifyContent: 'flex-end',
    },
    footerBtn: {
      minWidth: 132,
    },
    footerCancel: {
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    footerCancelText: {
      color: c.textPrimary,
    },
    roleCard: {
      marginTop: 16,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginBottom: 12,
    },
    roleBody: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 20,
    },
  });
}
