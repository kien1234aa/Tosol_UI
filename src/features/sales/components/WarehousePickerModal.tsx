import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LoginWarehouse } from '@services/auth/loginResponseTypes';
import { Button } from '@shared/components/ui/Button';
export type WarehousePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  sellerName: string;
  warehouses: LoginWarehouse[];
  selectedId: number | null;
  /** Goi API chuyen context; chi dong sheet sau khi Promise thanh cong. */
  onSelect: (id: number | null) => void | Promise<void>;
  /** Khoa chon khi dang xu ly (vd. shop.loading). */
  busy?: boolean;
};

export function WarehousePickerModal({
  visible,
  onClose,
  sellerName,
  warehouses,
  selectedId,
  onSelect,
  busy = false,
}: WarehousePickerModalProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_WarehousePickerModal_styles);

  const insets = useSafeAreaInsets();
  const [submittingId, setSubmittingId] = useState<number | 'all' | null>(null);
  const selectInFlight = useRef(false);

  useEffect(() => {
    if (!visible) {
      setSubmittingId(null);
      selectInFlight.current = false;
    }
  }, [visible]);

  const rows: { id: number | null; title: string; subtitle?: string }[] =
    useMemo(
      () => [
        {
          id: null,
          title: t('warehousePicker.allRowTitle', {
            sellerName,
            all: t('header.warehouseAll'),
          }),
          subtitle: t('warehousePicker.noFilterSubtitle'),
        },
        ...warehouses.map(w => ({
          id: w.id,
          title: w.name,
          subtitle: w.code,
        })),
      ],
      [sellerName, warehouses, t],
    );

  const handleSelectRow = useCallback(
    async (id: number | null) => {
      if (busy || selectInFlight.current) {
        return;
      }
      selectInFlight.current = true;
      const key: number | 'all' = id == null ? 'all' : id;
      setSubmittingId(key);
      try {
        await Promise.resolve(onSelect(id));
        onClose();
      } catch {
        /* Loi da bao o man hinh goi onSelect; khong dong sheet, tranh unhandled rejection */
      } finally {
        selectInFlight.current = false;
        setSubmittingId(null);
      }
    },
    [busy, onSelect, onClose],
  );

  type RowItem = { id: number | null; title: string; subtitle?: string };
  const renderItem = useCallback(
    ({ item }: { item: RowItem }) => {
      const selected = item.id === selectedId;
      const rowKey: number | 'all' = item.id == null ? 'all' : item.id;
      const rowBusy = submittingId === rowKey;
      const listLocked = busy || (submittingId != null && !rowBusy);
      return (
        <Pressable
          style={[
            styles.row,
            selected && styles.rowSelected,
            listLocked && styles.rowDisabled,
          ]}
          disabled={listLocked}
          onPress={() => {
            void handleSelectRow(item.id);
          }}
        >
          {rowBusy ? (
            <ActivityIndicator
              color={palette.teal}
              style={styles.rowSpinner}
            />
          ) : null}
          <Text style={styles.rowTitle}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={styles.rowSub}>{item.subtitle}</Text>
          ) : null}
        </Pressable>
      );
    },
    [
      selectedId,
      submittingId,
      busy,
      handleSelectRow,
      styles.row,
      styles.rowSelected,
      styles.rowDisabled,
      styles.rowSpinner,
      styles.rowTitle,
      styles.rowSub,
      palette.teal,
    ],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onPress={e => e.stopPropagation()}
        >
          <Text style={styles.sheetTitle}>{t('warehousePicker.title')}</Text>
          {(busy || submittingId != null) && (
            <View style={styles.busyBar}>
              <ActivityIndicator color={palette.teal} size="small" />
              <Text style={styles.busyText}>
                {t('warehousePicker.updating')}
              </Text>
            </View>
          )}
          <FlatList
            data={rows}
            keyExtractor={item => (item.id == null ? 'all' : String(item.id))}
            style={styles.list}
            renderItem={renderItem}
          />
          <Button
            title={t('header.close')}
            variant="secondary"
            size="sm"
            onPress={onClose}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function create_WarehousePickerModal_styles(c: AppColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
      maxHeight: '72%',
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 12,
    },
    busyBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    busyText: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
    },
    list: {
      marginBottom: 12,
    },
    row: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 8,
    },
    rowDisabled: {
      opacity: 0.45,
    },
    rowSpinner: {
      marginBottom: 8,
    },
    rowSelected: {
      borderColor: c.teal,
      backgroundColor: 'rgba(42,143,143,0.12)',
    },
    rowTitle: {
      color: c.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    rowSub: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
  });
}

export default WarehousePickerModal;
