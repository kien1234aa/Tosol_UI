import React, { memo, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { staffDetailCopy } from '@/src/configs/profile';
import {
  buttonContentCenter,
  buttonLabelStyle,
  lightTokens,
} from '@/src/configs/theme';
import { staffRoleToFormValue } from '@/src/helpers/profile/staff.helpers';
import type { UpdateStaffPayload } from '@/src/types/profile/staff.types';
import { PersonalInfoField } from './PersonalInfoField';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface StaffEditModalProps {
  visible: boolean;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialRole: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (payload: UpdateStaffPayload) => Promise<void>;
}

interface StaffEditFormProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialRole: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (payload: UpdateStaffPayload) => Promise<void>;
}

function staffEditFormKey(
  name: string,
  email: string,
  phone: string,
  role: string,
): string {
  return `${name}|${email}|${phone}|${role}`;
}

function StaffEditForm({
  initialName,
  initialEmail,
  initialPhone,
  initialRole,
  isSubmitting,
  onClose,
  onSave,
}: StaffEditFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [role, setRole] = useState<'admin' | 'staff'>(() =>
    staffRoleToFormValue(initialRole),
  );
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    const nextErrors: { name?: string; email?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      nextErrors.name = staffDetailCopy.nameRequired;
    }

    if (!trimmedEmail) {
      nextErrors.email = staffDetailCopy.emailRequired;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = staffDetailCopy.emailInvalid;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setServerError(null);

    try {
      await onSave({
        name: trimmedName,
        email: trimmedEmail,
        phone: phone.trim(),
        role,
      });
      onClose();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : staffDetailCopy.loadError,
      );
    }
  }, [email, name, onClose, onSave, phone, role]);

  return (
    <>
      <Text size="md" className="mb-4 font-semibold text-typography-900">
        {staffDetailCopy.editModalTitle}
      </Text>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}>
        <VStack space="md">
          <PersonalInfoField
            label={staffDetailCopy.fullNameLabel}
            placeholder="Nhập họ và tên"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <PersonalInfoField
            label={staffDetailCopy.emailLabel}
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
          />
          <PersonalInfoField
            label={staffDetailCopy.phoneLabel}
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <VStack space="xs">
            <Text size="sm" className="font-medium text-typography-700">
              {staffDetailCopy.roleLabel}
            </Text>
            <HStack className="gap-2">
              <Pressable
                onPress={() => setRole('staff')}
                disabled={isSubmitting}
                style={[
                  styles.roleChip,
                  role === 'staff' && styles.roleChipActive,
                ]}>
                <Text
                  size="sm"
                  className={
                    role === 'staff'
                      ? 'font-semibold text-tertiary-700'
                      : 'font-medium text-typography-700'
                  }>
                  {staffDetailCopy.roleStaff}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole('admin')}
                disabled={isSubmitting}
                style={[
                  styles.roleChip,
                  role === 'admin' && styles.roleChipActive,
                ]}>
                <Text
                  size="sm"
                  className={
                    role === 'admin'
                      ? 'font-semibold text-tertiary-700'
                      : 'font-medium text-typography-700'
                  }>
                  {staffDetailCopy.roleAdmin}
                </Text>
              </Pressable>
            </HStack>
          </VStack>

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
            {staffDetailCopy.editDismiss}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => void handleSave()}
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
              {staffDetailCopy.editSave}
            </Text>
          )}
        </Pressable>
      </HStack>
    </>
  );
}

function StaffEditModalComponent({
  visible,
  initialName,
  initialEmail,
  initialPhone,
  initialRole,
  isSubmitting,
  onClose,
  onSave,
}: StaffEditModalProps) {
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
            {visible ? (
              <StaffEditForm
                key={staffEditFormKey(
                  initialName,
                  initialEmail,
                  initialPhone,
                  initialRole,
                )}
                initialName={initialName}
                initialEmail={initialEmail}
                initialPhone={initialPhone}
                initialRole={initialRole}
                isSubmitting={isSubmitting}
                onClose={onClose}
                onSave={onSave}
              />
            ) : null}
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
    maxHeight: 420,
  },
  roleChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
    backgroundColor: lightTokens.background0,
    ...buttonContentCenter,
  },
  roleChipActive: {
    borderColor: lightTokens.tertiary400,
    backgroundColor: lightTokens.tertiary50,
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

export const StaffEditModal = memo(StaffEditModalComponent);
