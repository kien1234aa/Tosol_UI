import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listMobileCard } from '@shared/theme/surfaceStyles';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { createListCardLayoutStyles } from '@shared/components/ui/listMobileCard/listCardLayout';
import type { BankAccountListItem } from '@services/settings/bankAccountResponseTypes';

export type BankAccountListMobileCardProps = {
  row: BankAccountListItem;
  actionsLocked?: boolean;
  /** TK được chọn làm mặc định cho shop hiện tại. */
  isShopDefault?: boolean;
  onSetDefault?: () => void;
  onToggleActive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function BankAccountListMobileCard({
  row,
  actionsLocked,
  isShopDefault = false,
  onSetDefault,
  onToggleActive,
  onEdit,
  onDelete,
}: BankAccountListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const styles = useThemeStyleSheet(create_styles);
  const cardSurface = listMobileCard(c, mode);
  const insets = useSafeAreaInsets();
  const locked = Boolean(actionsLocked);
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = useCallback(() => {
    if (!locked) {
      setMenuOpen(true);
    }
  }, [locked]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          layout.card,
          cardSurface,
          layout.bodyTight,
          pressed && styles.cardPressed,
        ]}
        onLongPress={openMenu}
        delayLongPress={300}
      >
        <View style={layout.row}>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <View style={layout.row}>
              <Text
                style={[layout.headerTitle, { color: c.textPrimary, flex: 1 }]}
                numberOfLines={1}
              >
                {row.account_name}
              </Text>
              {isShopDefault ? (
                <StatusPill tone="info" emphasized={false} compact>
                  <Text>{'TK shop'}</Text>
                </StatusPill>
              ) : null}
              {row.is_default ? (
                <StatusPill tone="success" emphasized={false} compact>
                  <Text>{'Mặc định'}</Text>
                </StatusPill>
              ) : null}
              <StatusPill
                tone={row.is_active ? 'success' : 'neutral'}
                emphasized={false}
                compact
              >
                {row.is_active ? 'Bật' : 'Tắt'}
              </StatusPill>
            </View>
            <Text style={layout.metaSecondary} numberOfLines={1}>
              {row.bank_name} · STK {row.account_number}
            </Text>
          </View>
          <Pressable
            onPress={openMenu}
            hitSlop={8}
            style={styles.moreBtn}
            disabled={locked}
          >
            <SystemIcon name="ellipsisVertical" size={18} color={c.textMuted} />
          </Pressable>
        </View>
      </Pressable>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}
            onPress={e => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderInfo}>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  {row.account_name}
                </Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>
                  {row.bank_name} · {row.account_number}
                </Text>
              </View>
              <Pressable onPress={closeMenu} hitSlop={8}>
                <SystemIcon name="close" size={20} color={c.textMuted} />
              </Pressable>
            </View>

            {/* Actions */}
            {!row.is_default && onSetDefault != null ? (
              <ActionItem
                icon="star"
                iconColor={c.orange}
                label="Đặt làm mặc định"
                onPress={() => { closeMenu(); onSetDefault(); }}
                styles={styles}
              />
            ) : null}

            {onToggleActive != null ? (
              <ActionItem
                icon={row.is_active ? 'close' : 'check'}
                iconColor={row.is_active ? c.textMuted : c.green}
                label={row.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                onPress={() => { closeMenu(); onToggleActive(); }}
                styles={styles}
              />
            ) : null}

            {onEdit != null ? (
              <ActionItem
                icon="pencil"
                iconColor={c.textLink}
                label="Chỉnh sửa"
                onPress={() => { closeMenu(); onEdit(); }}
                styles={styles}
              />
            ) : null}

            {onDelete != null ? (
              <ActionItem
                icon="trash"
                iconColor={c.red}
                label="Xóa tài khoản"
                labelColor={c.red}
                onPress={() => { closeMenu(); onDelete(); }}
                styles={styles}
                danger
              />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type ActionItemProps = {
  icon: React.ComponentProps<typeof SystemIcon>['name'];
  iconColor: string;
  label: string;
  labelColor?: string;
  onPress: () => void;
  styles: ReturnType<typeof create_styles>;
  danger?: boolean;
};

function ActionItem({ icon, iconColor, label, labelColor, onPress, styles, danger }: ActionItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionRow,
        danger && styles.actionRowDanger,
        pressed && styles.actionRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <SystemIcon name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.actionLabel, labelColor ? { color: labelColor } : undefined]}>
        {label}
      </Text>
    </Pressable>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    cardPressed: { opacity: 0.82 },
    moreBtn: {
      paddingLeft: 8,
      paddingVertical: 4,
      alignSelf: 'center',
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 8,
      overflow: 'hidden',
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      gap: 12,
    },
    sheetHeaderInfo: { flex: 1, minWidth: 0 },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
    },
    sheetSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 2,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    actionRowDanger: {
      backgroundColor: 'rgba(239,68,68,0.04)',
    },
    actionRowPressed: { opacity: 0.7 },
    actionIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.bgButton,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
      flex: 1,
    },
  });
}
