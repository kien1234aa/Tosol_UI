import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { DetailCard } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  createSellerWebhook,
  updateSellerWebhook,
} from '@services/settings/webhookAPI';
import type { SellerWebhookApi } from '@services/settings/webhookApiTypes';

// Danh sách sự kiện theo web
const WEBHOOK_EVENTS: { key: string; label: string }[] = [
  { key: 'order.created',       label: 'Đơn hàng tạo mới' },
  { key: 'order.confirmed',     label: 'Đơn hàng xác nhận' },
  { key: 'order.ready_to_ship', label: 'Sẵn sàng giao' },
  { key: 'order.shipped',       label: 'Đã giao vận chuyển' },
  { key: 'order.delivered',     label: 'Đã giao hàng' },
  { key: 'order.cancelled',     label: 'Đã hủy' },
  { key: 'order.returned',      label: 'Đã hoàn trả' },
];

export type SellerWebhookFormModalProps = {
  visible: boolean;
  /** `null` = tạo mới; có giá trị = sửa. */
  editing: SellerWebhookApi | null;
  onClose: () => void;
  onSaved?: () => void;
};

export function SellerWebhookFormModal({
  visible,
  editing,
  onClose,
  onSaved,
}: SellerWebhookFormModalProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const isEdit = editing != null;

  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (editing) {
      setUrl(editing.url === '—' ? '' : editing.url);
      setDescription(editing.description?.trim() ?? '');
      const evArr = editing.events ?? [];
      setSelectedEvents(new Set(evArr));
      setIsActive(editing.is_active);
    } else {
      setUrl('');
      setDescription('');
      setSelectedEvents(new Set());
      setIsActive(true);
    }
    setSubmitting(false);
  }, [visible, editing]);

  const toggleEvent = useCallback((key: string) => {
    setSelectedEvents(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const onSubmit = useCallback(async () => {
    const urlTrim = url.trim();
    if (!urlTrim) {
      toast.warning('Nhập URL endpoint nhận webhook.');
      return;
    }
    if (!/^https?:\/\//i.test(urlTrim)) {
      toast.warning('URL phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    if (selectedEvents.size === 0) {
      toast.warning('Vui lòng chọn ít nhất một sự kiện.');
      return;
    }
    const events = Array.from(selectedEvents);
    setSubmitting(true);
    try {
      if (isEdit && editing) {
        await updateSellerWebhook(editing.id, {
          url: urlTrim,
          description: description.trim() || null,
          is_active: isActive,
          events,
        });
        toast.success('Đã cập nhật webhook.');
      } else {
        await createSellerWebhook({
          url: urlTrim,
          description: description.trim() || null,
          is_active: isActive,
          events,
        });
        toast.success('Đã tạo webhook thành công.');
      }
      onSaved?.();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  }, [url, description, selectedEvents, isActive, isEdit, editing, onSaved, onClose]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top safe-area back button */}
        <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 12) }]}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.backBtn}>
            <SystemIcon name="chevronBack" size={22} color={palette.cyan} />
            <Text style={styles.backTxt}>Quay lại</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            canvasListScrollContent({ paddingHorizontal: 0 }),
            { paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormScreenHeading
            sectionLabel="Webhook"
            title={isEdit ? 'Sửa webhook' : 'Thêm webhook'}
          />

          {/* Thông tin cơ bản */}
          <DetailCard title="Thông tin cơ bản" icon="link">
            <TextField
              label="URL *"
              variant="dark"
              placeholder="https://example.com/webhook"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
              editable={!submitting}
            />
            <TextField
              label="Mô tả"
              variant="dark"
              placeholder="Ghi chú nội bộ (tuỳ chọn)"
              value={description}
              onChangeText={setDescription}
              editable={!submitting}
            />
          </DetailCard>

          {/* Sự kiện */}
          <DetailCard title="Sự kiện *" icon="notifications">
            {WEBHOOK_EVENTS.map((ev, idx) => {
              const checked = selectedEvents.has(ev.key);
              const isLast = idx === WEBHOOK_EVENTS.length - 1;
              return (
                <Pressable
                  key={ev.key}
                  style={[styles.checkRow, isLast && styles.checkRowLast]}
                  onPress={() => !submitting && toggleEvent(ev.key)}
                  disabled={submitting}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxChecked,
                    ]}
                  >
                    {checked ? (
                      <SystemIcon name="check" size={12} color="#fff" />
                    ) : null}
                  </View>
                  <Text style={styles.checkLabel}>{ev.label}</Text>
                  <Text style={styles.checkKey}>{ev.key}</Text>
                </Pressable>
              );
            })}
          </DetailCard>

          {/* Cài đặt */}
          <DetailCard title="Cài đặt" icon="settings">
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Kích hoạt</Text>
                <Text style={styles.switchHint}>
                  Webhook sẽ nhận sự kiện khi được kích hoạt
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                disabled={submitting}
                trackColor={{ false: palette.border, true: palette.greenBg }}
                thumbColor={isActive ? palette.green : palette.textMuted}
              />
            </View>
          </DetailCard>

          {/* Footer buttons inside scroll */}
          <View style={styles.footerRow}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={onClose}
              disabled={submitting}
              style={[styles.footerBtn, styles.footerCancel]}
              textStyle={styles.footerCancelTxt}
            />
            <Button
              title={isEdit ? 'Lưu' : 'Tạo Mới'}
              variant="primary"
              onPress={() => { void onSubmit(); }}
              loading={submitting}
              disabled={submitting}
              style={styles.footerBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 8,
    },
    backTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.cyan,
    },
    scroll: { flex: 1 },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    checkRowLast: {
      borderBottomWidth: 0,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: c.teal,
      borderColor: c.teal,
    },
    checkLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    checkKey: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    switchInfo: { flex: 1, minWidth: 0 },
    switchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    switchHint: {
      fontSize: 12,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 2,
    },
    footerRow: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: 20,
      marginTop: 8,
    },
    footerBtn: {
      flex: 1,
    },
    footerCancel: {
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    footerCancelTxt: {
      color: c.textPrimary,
    },
  });
}
