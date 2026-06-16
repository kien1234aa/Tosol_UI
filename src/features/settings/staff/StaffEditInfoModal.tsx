import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  FormMenuSelect,
  type FormMenuOption,
} from '../shops/components/FormMenuSelect';
import { updateStaffUser } from '@services/settings/staffAPI';
import type { StaffUserDetailApi } from '@services/settings/staffApiTypes';

const ROLE_OPTIONS: FormMenuOption<'staff' | 'admin'>[] = [
  { key: 'staff', label: 'Nhân viên (nhà bán)' },
  { key: 'admin', label: 'Quản lý (nhà bán)' },
];

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function roleFromDetail(role: string): 'admin' | 'staff' {
  return String(role).trim().toLowerCase() === 'admin' ? 'admin' : 'staff';
}

export type StaffEditInfoModalProps = {
  visible: boolean;
  userUuid: string;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialRole: string;
  onClose: () => void;
  onSaved: (user: StaffUserDetailApi) => void;
};

export function StaffEditInfoModal({
  visible,
  userUuid,
  initialName,
  initialEmail,
  initialPhone,
  initialRole,
  onClose,
  onSaved,
}: StaffEditInfoModalProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [role, setRole] = useState<'staff' | 'admin'>(() =>
    roleFromDetail(initialRole),
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setName(initialName);
    setEmail(initialEmail);
    setPhone(initialPhone);
    setRole(roleFromDetail(initialRole));
  }, [visible, initialName, initialEmail, initialPhone, initialRole]);

  const roleOptions = useMemo(() => ROLE_OPTIONS, []);

  const handleSave = useCallback(() => {
    const u = userUuid.trim();
    if (!u) {
      toast.error('Thiếu mã định danh người dùng.');
      return;
    }
    const n = name.trim();
    const e = email.trim();
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
    void (async () => {
      setSubmitting(true);
      try {
        const updated = await updateStaffUser(u, {
          name: n,
          email: e,
          phone: phone.trim(),
          role,
        });
        toast.success('Đã cập nhật thông tin nhân viên.');
        onSaved(updated);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [userUuid, name, email, phone, role, onSaved]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={styles.kb} behavior="padding">
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdropFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Đóng"
          />
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.headerIcons}>
                <SystemIcon name="person" size={22} color={palette.teal} />
                <SystemIcon name="pencil" size={18} color={palette.teal} />
              </View>
              <Text style={styles.title}>Sửa thông tin</Text>
            </View>
            <View style={styles.rule} />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              <TextField
                label="Họ tên"
                variant="dark"
                value={name}
                onChangeText={setName}
                editable={!submitting}
                startIcon={
                  <SystemIcon
                    name="person"
                    size={20}
                    color={palette.textMuted}
                  />
                }
              />
              <TextField
                label="Email"
                variant="dark"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!submitting}
                containerStyle={styles.fieldSp}
                startIcon={
                  <SystemIcon name="mail" size={20} color={palette.textMuted} />
                }
              />
              <TextField
                label="Số điện thoại"
                variant="dark"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!submitting}
                containerStyle={styles.fieldSp}
                startIcon={
                  <SystemIcon name="call" size={20} color={palette.textMuted} />
                }
              />
              <View style={styles.fieldSp}>
                <FormMenuSelect
                  label="Vai trò"
                  sheetTitle="Chọn vai trò"
                  options={roleOptions}
                  value={role}
                  onChange={setRole}
                  disabled={submitting}
                  leadingSlot={
                    <SystemIcon
                      name="shield"
                      size={20}
                      color={palette.textMuted}
                    />
                  }
                />
              </View>
            </ScrollView>
            <View style={styles.rule} />
            <View style={styles.footer}>
              <Button
                title="Hủy"
                variant="outline"
                disabled={submitting}
                onPress={onClose}
                style={[styles.footerCancel, styles.footerBtn]}
                textStyle={styles.footerCancelText}
              />
              <Button
                variant="primary"
                disabled={submitting}
                loading={submitting}
                onPress={handleSave}
                style={styles.footerBtn}
              >
                <View style={styles.saveRow}>
                  <SystemIcon name="save" size={18} color="#fff" />
                  <Text style={styles.saveTxt}>Lưu</Text>
                </View>
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    kb: { flex: 1 },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    backdropFill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.bgOverlay,
      zIndex: 0,
    },
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 440,
      maxHeight: '88%',
      backgroundColor: c.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      zIndex: 2,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 4,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
    },
    rule: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginVertical: 12,
    },
    scroll: { maxHeight: 400 },
    scrollContent: { paddingBottom: 4 },
    fieldSp: { marginTop: 12 },
    footer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 4,
    },
    footerBtn: {
      minWidth: 120,
    },
    footerCancel: {
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    footerCancelText: {
      color: c.textPrimary,
    },
    saveRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    saveTxt: {
      fontSize: 15,
      fontWeight: '800',
      color: '#ffffff',
    },
  });
}
