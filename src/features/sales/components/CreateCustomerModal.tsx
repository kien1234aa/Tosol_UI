import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { SystemIcon, type SystemIconName } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import type { CreateCustomerPayload } from '@services/category/customerApiTypes';

export type CreateCustomerFormValues = CreateCustomerPayload;

export type CreateCustomerModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Gọi API tạo khách; khi resolve thì modal sẽ đóng. */
  onSubmit: (values: CreateCustomerFormValues) => Promise<void>;
};

function submitFailMessage(e: unknown): string {
  if (typeof e === 'string') {
    return e;
  }
  if (e && typeof e === 'object') {
    const o = e as { payload?: unknown; message?: unknown };
    if (typeof o.payload === 'string' && o.payload.trim()) {
      return o.payload;
    }
    if (typeof o.message === 'string' && o.message.trim()) {
      return o.message;
    }
  }
  return 'Không tạo được khách hàng';
}

const REQ = 'Trường này là bắt buộc';

function FieldIcon({
  name,
  iconColor,
}: {
  name: SystemIconName;
  iconColor: string;
}) {
  return (
    <View style={ic.glyphSlot}>
      <SystemIcon name={name} size={18} color={iconColor} />
    </View>
  );
}

const ic = StyleSheet.create({
  glyphSlot: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function createHeaderIconStyles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: { width: 40, height: 40, marginRight: 10 },
    person: {
      position: 'absolute',
      left: 4,
      bottom: 2,
      alignItems: 'center',
    },
    head: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: c.textSecondary,
      marginBottom: 1,
    },
    body: {
      width: 16,
      height: 9,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderWidth: 1.5,
      borderBottomWidth: 0,
      borderColor: c.textSecondary,
    },
    plusBadge: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.tealDim,
      borderWidth: 1,
      borderColor: c.teal,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plusTxt: {
      fontSize: 13,
      fontWeight: '800',
      color: c.tealLight,
      marginTop: -1,
    },
  });
}

function HeaderIcon() {
  const hd = useThemeStyleSheet(createHeaderIconStyles);
  return (
    <View style={hd.wrap}>
      <View style={hd.person}>
        <View style={hd.head} />
        <View style={hd.body} />
      </View>
      <View style={hd.plusBadge}>
        <Text style={hd.plusTxt}>+</Text>
      </View>
    </View>
  );
}

export function CreateCustomerModal({
  visible,
  onClose,
  onSubmit,
}: CreateCustomerModalProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const st = useThemeStyleSheet(createCreateCustomerModalStyles);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nameErr, setNameErr] = useState<string | undefined>();
  const [phoneErr, setPhoneErr] = useState<string | undefined>();
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNameErr(undefined);
      setPhoneErr(undefined);
      setSubmitErr(null);
      setSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = useCallback(async () => {
    const n = name.trim();
    const p = phone.trim();
    let ok = true;
    if (!n) {
      setNameErr(REQ);
      ok = false;
    } else {
      setNameErr(undefined);
    }
    if (!p) {
      setPhoneErr(REQ);
      ok = false;
    } else {
      setPhoneErr(undefined);
    }
    if (!ok) {
      return;
    }
    setSubmitErr(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: n,
        phone: p,
        email: email.trim(),
        address: address.trim(),
      });
      onClose();
    } catch (e) {
      setSubmitErr(submitFailMessage(e));
    } finally {
      setSubmitting(false);
    }
  }, [name, phone, email, address, onClose, onSubmit]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={st.kavRoot}>
        <View style={st.backdrop}>
          <Pressable
            style={st.backdropFill}
            onPress={onClose}
            accessibilityLabel="Đóng"
          />
          <View style={[st.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={st.header}>
              <View style={st.headerLeft}>
                <HeaderIcon />
                <Text style={st.title}>Tạo khách hàng</Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                style={st.closeBtn}
                accessibilityLabel="Đóng"
              >
                <SystemIcon
                  name="close"
                  size={22}
                  color={palette.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={st.form}
            >
              <TextField
                variant="dark"
                size="md"
                label="Tên khách hàng *"
                value={name}
                onChangeText={t => {
                  setName(t);
                  if (nameErr) {
                    setNameErr(undefined);
                  }
                }}
                placeholder="Nhập tên"
                error={nameErr}
                startIcon={
                  <FieldIcon name="person" iconColor={palette.textSecondary} />
                }
                containerStyle={st.field}
              />
              <TextField
                variant="dark"
                size="md"
                label="Điện thoại *"
                value={phone}
                onChangeText={t => {
                  setPhone(t);
                  if (phoneErr) {
                    setPhoneErr(undefined);
                  }
                }}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
                error={phoneErr}
                startIcon={
                  <FieldIcon name="call" iconColor={palette.textSecondary} />
                }
                containerStyle={st.field}
              />
              <TextField
                variant="dark"
                size="md"
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="email@…"
                keyboardType="email-address"
                startIcon={
                  <FieldIcon name="mail" iconColor={palette.textSecondary} />
                }
                containerStyle={st.field}
              />
              <TextField
                variant="dark"
                size="md"
                label="Địa chỉ"
                value={address}
                onChangeText={setAddress}
                placeholder="Địa chỉ"
                multiline
                numberOfLines={4}
                startIcon={
                  <FieldIcon
                    name="location"
                    iconColor={palette.textSecondary}
                  />
                }
                containerStyle={st.fieldLast}
              />
            </ScrollView>

            {submitErr ? <Text style={st.submitErr}>{submitErr}</Text> : null}

            <View style={st.footer}>
              <Pressable
                style={[st.cancelBtn, submitting && st.footerDis]}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={st.cancelTxt}>Huỷ</Text>
              </Pressable>
              <Button
                title="Tạo mới"
                variant="primary"
                size="md"
                onPress={() => void handleSubmit()}
                loading={submitting}
                disabled={submitting}
                style={st.primaryBtn}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createCreateCustomerModalStyles(c: AppColorPalette) {
  return StyleSheet.create({
    kavRoot: { flex: 1 },
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    backdropFill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.bgOverlay,
      zIndex: 0,
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      maxHeight: '88%',
      overflow: 'hidden',
      zIndex: 2,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: 8,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
    },
    closeBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    form: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
    },
    field: {
      marginBottom: 12,
    },
    fieldLast: {
      marginBottom: 8,
    },
    submitErr: {
      fontSize: 13,
      color: c.red,
      fontWeight: '600',
      paddingHorizontal: 16,
      paddingBottom: 8,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    cancelBtn: {
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: c.borderLight,
      backgroundColor: 'transparent',
    },
    cancelTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textSecondary,
    },
    primaryBtn: {
      minWidth: 130,
    },
    footerDis: {
      opacity: 0.5,
    },
  });
}
