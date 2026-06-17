import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { staffDetailCopy, staffPasswordRules } from '@/src/configs/profile';
import {
  buttonContentCenter,
  buttonLabelStyle,
  lightTokens,
} from '@/src/configs/theme';
import type { ChangeStaffPasswordPayload } from '@/src/types/profile/staff.types';
import { ChangePasswordField } from './ChangePasswordField';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { Pressable } from '@/src/uikits/pressable';
import { HStack } from '@/src/uikits/hstack';

export interface StaffChangePasswordModalProps {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ChangeStaffPasswordPayload) => Promise<void>;
}

function StaffChangePasswordModalComponent({
  visible,
  isSubmitting,
  onClose,
  onSubmit,
}: StaffChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setServerError(null);
  }, [visible]);

  const handleSubmit = useCallback(async () => {
    const nextErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = staffDetailCopy.currentPasswordRequired;
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = staffDetailCopy.newPasswordRequired;
    } else if (newPassword.length < staffPasswordRules.minLength) {
      nextErrors.newPassword = staffDetailCopy.newPasswordTooShort;
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = staffDetailCopy.confirmPasswordRequired;
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = staffDetailCopy.confirmPasswordMismatch;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setServerError(null);

    try {
      await onSubmit({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : staffDetailCopy.loadError,
      );
    }
  }, [confirmPassword, currentPassword, newPassword, onClose, onSubmit]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RNPressable style={styles.overlay} onPress={onClose}>
          <RNPressable style={styles.sheet} onPress={() => {}}>
            <Text size="md" className="mb-2 font-semibold text-typography-900">
              {staffDetailCopy.changePasswordTitle}
            </Text>
            <Text size="sm" className="mb-4 text-typography-600">
              {staffDetailCopy.changePasswordHint}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}>
              <VStack space="md">
                <ChangePasswordField
                  label={staffDetailCopy.adminCurrentPasswordLabel}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  error={errors.currentPassword}
                  showPassword={showCurrentPassword}
                  onToggleShowPassword={() =>
                    setShowCurrentPassword(current => !current)
                  }
                />
                <ChangePasswordField
                  label={staffDetailCopy.newPasswordLabel}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  error={errors.newPassword}
                  showPassword={showNewPassword}
                  onToggleShowPassword={() =>
                    setShowNewPassword(current => !current)
                  }
                />
                <ChangePasswordField
                  label={staffDetailCopy.confirmPasswordLabel}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                  showPassword={showConfirmPassword}
                  onToggleShowPassword={() =>
                    setShowConfirmPassword(current => !current)
                  }
                />

                {serverError ? (
                  <Text size="sm" className="text-error-500">
                    {serverError}
                  </Text>
                ) : null}
              </VStack>
            </ScrollView>

            <HStack className="mt-4 gap-3">
              <Pressable
                onPress={onClose}
                disabled={isSubmitting}
                style={[styles.dismissButton, buttonContentCenter]}>
                <Text
                  size="sm"
                  className="font-semibold text-typography-700"
                  style={buttonLabelStyle}>
                  {staffDetailCopy.cancel}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void handleSubmit()}
                disabled={isSubmitting}
                style={[
                  styles.confirmButton,
                  buttonContentCenter,
                  isSubmitting && styles.confirmButtonDisabled,
                ]}>
                {isSubmitting ? (
                  <ActivityIndicator color={lightTokens.typography0} size="small" />
                ) : (
                  <Text
                    size="sm"
                    className="font-semibold text-typography-0"
                    style={buttonLabelStyle}>
                    {staffDetailCopy.changePasswordSubmit}
                  </Text>
                )}
              </Pressable>
            </HStack>
          </RNPressable>
        </RNPressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    maxHeight: '88%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  scroll: {
    maxHeight: 380,
  },
  dismissButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
    backgroundColor: lightTokens.background0,
  },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: lightTokens.tertiary500,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
});

export const StaffChangePasswordModal = memo(StaffChangePasswordModalComponent);
