import React from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '../icons/SystemIcon';
import { useAppColors } from '../../theme/ThemeContext';
import { ON_BRAND } from '../../theme/designTokens';
import { useSellerChromeStyles } from './useSellerChromeStyles';

export type SellerChromeScreenHeaderProps = {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  /** Badge đỏ trên nút thông báo. */
  notificationBadge?: string;
  /** Thu gọn chiều cao header (dùng cho các màn không phải dashboard). */
  compact?: boolean;
  style?: ViewStyle;
};

/** Header cong teal — giao diện seller chuẩn (khớp sellerUiDemo). */
export function SellerChromeScreenHeader({
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onOpenSettings,
  onOpenNotifications,
  notificationBadge,
  compact = false,
  style,
}: SellerChromeScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const s = useSellerChromeStyles();

  return (
    <View
      style={[
        s.headerShell,
        compact ? s.headerPadCompact : s.headerPad,
        { paddingTop: insets.top + (compact ? 2 : 10) },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: compact ? 0 : 12,
        }}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={compact ? s.headerTitleCompact : s.headerTitle}>
            {title}
          </Text>
          {!compact && subtitle ? (
            <Text style={s.headerSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {onOpenNotifications ? (
            <Pressable
              style={s.headerIconBtn}
              onPress={onOpenNotifications}
              accessibilityRole="button"
            >
              <SystemIcon name="notifications" size={20} color={ON_BRAND} />
              {notificationBadge ? (
                <View style={badgeStyles.badge}>
                  <Text style={badgeStyles.badgeText}>{notificationBadge}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}
          {onOpenSettings ? (
            <Pressable
              style={s.headerIconBtn}
              onPress={onOpenSettings}
              accessibilityRole="button"
            >
              <SystemIcon name="settings" size={20} color={ON_BRAND} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {searchPlaceholder ? (
        <View style={s.searchWrap}>
          <SystemIcon name="search" size={18} color={c.textMuted} />
          <TextInput
            placeholder={searchPlaceholder}
            placeholderTextColor={c.textMuted}
            style={s.searchInput}
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </View>
      ) : null}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#c44d4d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: ON_BRAND,
    fontSize: 12,
    fontWeight: '800',
  },
});
