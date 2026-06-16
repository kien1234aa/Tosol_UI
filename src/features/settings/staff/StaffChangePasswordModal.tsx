import React, { useCallback, useEffect, useState } from 'react';
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
import { changeStaffUserPassword } from '@services/settings/staffAPI';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';

const PW_MIN = 8;

export type StaffChangePasswordModalProps = {
  visible: boolean;
  userUuid: string;
  onClose: () => void;
  /** Đổi mật khẩu tài khoản đang đăng nhập (thông báo + callback khác). */
  forCurrentUser?: boolean;
  onPasswordChanged?: () => void;
};

export function StaffChangePasswordModal({
  visible,
  userUuid,
  onClose,
  forCurrentUser = false,
  onPasswordChanged,
}: StaffChangePasswordModalProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const [current, setCurrent] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCurrent('');
    setNextPw('');
    setConfirm('');
  }, [visible]);

  const handleSubmit = useCallback(() => {
    const u = userUuid.trim();
    if (!u) {
      toast.error('Thiếu mã định danh người dùng.');
      return;
    }
    if (!current) {
      toast.warning('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (nextPw.length < PW_MIN) {
      toast.warning(`Mật khẩu mới tối thiểu ${PW_MIN} ký tự.`);
      return;
    }
    if (nextPw !== confirm) {
      toast.warning('Mật khẩu xác nhận không khớp.');
      return;
    }
    void (async () => {
      setSubmitting(true);
      try {
        await changeStaffUserPassword(u, {
          current_password: current,
          new_password: nextPw,
          new_password_confirmation: confirm,
        });
        onClose();
        toast.success(
          forCurrentUser
            ? 'Bạn cần đăng nhập lại bằng mật khẩu mới.'
            : 'Người dùng sẽ cần đăng nhập lại bằng mật khẩu mới.',
        );
        onPasswordChanged?.();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [
    userUuid,
    current,
    nextPw,
    confirm,
    onClose,
    forCurrentUser,
    onPasswordChanged,
  ]);

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
              <SystemIcon name="lock" size={22} color={palette.textSecondary} />
              <Text style={styles.title}>Đổi mật khẩu</Text>
            </View>
            <View style={styles.rule} />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              <TextField
                label=""
                variant="dark"
                value={current}
                onChangeText={setCurrent}
                placeholder="Mật khẩu hiện tại"
                isPassword
                editable={!submitting}
              />
              <TextField
                label=""
                variant="dark"
                value={nextPw}
                onChangeText={setNextPw}
                placeholder="Mật khẩu mới"
                isPassword
                editable={!submitting}
                containerStyle={styles.fieldSp}
              />
              <Text style={styles.pwHint}>Tối thiểu 8 ký tự</Text>
              <TextField
                label=""
                variant="dark"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Xác nhận mật khẩu mới"
                isPassword
                editable={!submitting}
                containerStyle={styles.fieldSpAfterHint}
              />

              <View style={styles.infoBanner}>
                <SystemIcon name="info" size={20} color={palette.tealLight} />
                <Text style={styles.infoBannerTxt}>
                  Người dùng sẽ cần sử dụng mật khẩu mới khi đăng nhập lần tiếp
                  theo.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.rule} />
            <View style={styles.footer}>
              <Pressable onPress={onClose} disabled={submitting} hitSlop={8}>
                <Text style={styles.cancelTxt}>Hủy</Text>
              </Pressable>
              <Button
                variant="primary"
                disabled={submitting}
                loading={submitting}
                onPress={handleSubmit}
                style={styles.submitBtn}
              >
                <View style={styles.submitRow}>
                  <SystemIcon name="key" size={18} color="#fff" />
                  <Text style={styles.submitTxt}>Đổi Mật Khẩu</Text>
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
      maxHeight: '90%',
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
    scroll: { maxHeight: 420 },
    scrollContent: { paddingBottom: 4 },
    fieldSp: { marginTop: 12 },
    fieldSpAfterHint: { marginTop: 10 },
    pwHint: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(45,212,191,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(45,212,191,0.32)',
    },
    infoBannerTxt: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: c.tealLight,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 20,
      marginTop: 4,
    },
    cancelTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textMuted,
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    submitBtn: {
      minWidth: 168,
    },
    submitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    submitTxt: {
      fontSize: 15,
      fontWeight: '800',
      color: '#ffffff',
    },
  });
}
