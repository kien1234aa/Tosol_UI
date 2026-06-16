import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
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
import type { SellerShippingPartnerApi } from '@services/settings/shipApiTypes';

export type SettingsShipPartnerListMobileCardProps = {
  row: SellerShippingPartnerApi;
  actionsLocked?: boolean;
  /** Kết nối được chọn làm mặc định cho shop hiện tại. */
  isShopDefault?: boolean;
  onTestConnection?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function SettingsShipPartnerListMobileCardImpl({
  row,
  actionsLocked,
  isShopDefault = false,
  onTestConnection,
  onEdit,
  onDelete,
}: SettingsShipPartnerListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const styles = useThemeStyleSheet(create_styles);
  const cardSurface = listMobileCard(c, mode);
  const insets = useSafeAreaInsets();
  const locked = Boolean(actionsLocked);
  const [menuOpen, setMenuOpen] = useState(false);

  const partnerName = row.shipping_partner?.name?.trim() || 'Đối tác';
  const logoUri = useMemo(
    () => (row.shipping_partner?.logo_url ?? '').trim(),
    [row.shipping_partner?.logo_url],
  );
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUri, row.id]);

  const serviceLine =
    row.default_service != null && row.default_service.length > 0
      ? `DV: ${row.default_service}`
      : null;

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
          <View style={layout.thumb}>
            {logoUri.length > 0 && !logoFailed ? (
              <Image
                source={{ uri: logoUri }}
                style={layout.thumbImg}
                resizeMode="cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <SystemIcon name="truck" size={18} color={c.textMuted} />
            )}
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <View style={layout.row}>
              <Text
                style={[layout.headerTitle, { color: c.textPrimary, flex: 1 }]}
                numberOfLines={1}
              >
                {partnerName}
              </Text>
              {isShopDefault ? (
                <StatusPill tone="info" emphasized={false} compact>
                  Shop
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
            {serviceLine ? (
              <Text style={layout.meta} numberOfLines={1}>
                {serviceLine}
              </Text>
            ) : null}
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
              <View style={styles.sheetHeaderLeading}>
                {logoUri.length > 0 && !logoFailed ? (
                  <Image
                    source={{ uri: logoUri }}
                    style={styles.sheetLogo}
                    resizeMode="contain"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <View style={styles.sheetLogoFallback}>
                    <SystemIcon name="truck" size={20} color={c.textMuted} />
                  </View>
                )}
              </View>
              <View style={styles.sheetHeaderInfo}>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  {partnerName}
                </Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>
                  {serviceLine ?? partnerName}
                </Text>
              </View>
              <Pressable onPress={closeMenu} hitSlop={8}>
                <SystemIcon name="close" size={20} color={c.textMuted} />
              </Pressable>
            </View>

            {/* Actions */}
            {onTestConnection != null ? (
              <ActionItem
                icon="activity"
                iconColor={c.textLink}
                label="Kiểm tra kết nối"
                onPress={() => { closeMenu(); onTestConnection(); }}
                styles={styles}
              />
            ) : null}

            {onEdit != null ? (
              <ActionItem
                icon="pencil"
                iconColor={c.textLink}
                label="Chỉnh sửa cấu hình"
                onPress={() => { closeMenu(); onEdit(); }}
                styles={styles}
              />
            ) : null}

            {onDelete != null ? (
              <ActionItem
                icon="trash"
                iconColor={c.red}
                label="Xóa kết nối"
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

function ActionItem({
  icon,
  iconColor,
  label,
  labelColor,
  onPress,
  styles,
  danger,
}: ActionItemProps) {
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
      <Text
        style={[
          styles.actionLabel,
          labelColor ? { color: labelColor } : undefined,
        ]}
      >
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
    sheetHeaderLeading: {
      width: 44,
      height: 44,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: c.bgButton,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetLogo: { width: 44, height: 44, borderRadius: 10 },
    sheetLogoFallback: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.bgButton,
      alignItems: 'center',
      justifyContent: 'center',
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

export const SettingsShipPartnerListMobileCard = React.memo(
  SettingsShipPartnerListMobileCardImpl,
);
