import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
export type ProductDeleteConfirmModalProps = {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ProductDeleteConfirmModal({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}: ProductDeleteConfirmModalProps) {
  const styles = useThemeStyleSheet(create_ProductDeleteConfirmModal_styles);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <Pressable style={styles.overlay} onPress={() => !loading && onCancel()}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={styles.titleRow}>
            <View style={styles.warnIcon}>
              <Text style={styles.warnIconTxt}>!</Text>
            </View>
            <Text style={styles.title}>Xóa sản phẩm</Text>
          </View>
          <Text style={styles.message}>
            Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                styles.btnGhost,
                pressed && !loading && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              <Text style={styles.btnGhostTxt}>Hủy</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!loading) {
                  onConfirm();
                }
              }}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                pressed && !loading && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0d1b2a" />
              ) : (
                <Text style={styles.btnPrimaryTxt}>Xác nhận</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function create_ProductDeleteConfirmModal_styles(c: AppColorPalette) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: c.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 18,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    warnIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(245,158,11,0.95)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    warnIconTxt: {
      fontSize: 22,
      fontWeight: '900',
      color: '#fff',
      marginTop: -1,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
    },
    message: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 21,
      marginBottom: 20,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    btn: {
      minWidth: 100,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnGhost: {
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    btnGhostTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textSecondary,
    },
    btnPrimary: {
      backgroundColor: c.cyan,
    },
    btnPrimaryTxt: {
      fontSize: 15,
      fontWeight: '800',
      color: '#0d1b2a',
    },
    btnPressed: {
      opacity: 0.88,
    },
    btnDisabled: {
      opacity: 0.55,
    },
  });
}
