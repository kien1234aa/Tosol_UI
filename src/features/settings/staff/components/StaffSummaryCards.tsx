import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon, type SystemIconName } from '@shared/components/icons/SystemIcon';
import type { StaffUserCounts } from '@services/settings/staffSlice';

export type StaffSummaryCardsProps = {
  counts: StaffUserCounts;
  loading?: boolean;
  statusFilter: 'all' | 'active' | 'inactive';
  onSelectStatus: (key: 'all' | 'active' | 'inactive') => void;
};

type StaffSummaryStyles = ReturnType<typeof create_styles>;

function StaffSummaryCard({
  segment,
  count,
  label,
  icon,
  iconColor,
  showFunnel,
  loading,
  statusFilter,
  onSelectStatus,
  styles,
  funnelColor,
}: {
  segment: 'all' | 'active' | 'inactive';
  count: number;
  label: string;
  icon: SystemIconName;
  iconColor: string;
  showFunnel?: boolean;
  loading: boolean;
  statusFilter: 'all' | 'active' | 'inactive';
  onSelectStatus: (key: 'all' | 'active' | 'inactive') => void;
  styles: StaffSummaryStyles;
  funnelColor: string;
}) {
  const selected = statusFilter === segment;
  return (
    <Pressable
      onPress={() => onSelectStatus(segment)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[styles.iconSlot, { backgroundColor: `${iconColor}22` }]}
        >
          <SystemIcon name={icon} size={22} color={iconColor} />
        </View>
        {showFunnel ? (
          <SystemIcon name="funnel" size={16} color={funnelColor} />
        ) : (
          <View style={styles.funnelSpacer} />
        )}
      </View>
      <Text style={styles.countTxt}>
        {loading ? '—' : count.toLocaleString('vi-VN')}
      </Text>
      <Text style={styles.labelTxt} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StaffSummaryCards({
  counts,
  loading = false,
  statusFilter,
  onSelectStatus,
}: StaffSummaryCardsProps) {
  const styles = useThemeStyleSheet(create_styles);
  const palette = useAppColors();

  return (
    <View style={styles.row}>
      <StaffSummaryCard
        segment="all"
        count={counts.all}
        label="Tất cả người dùng"
        icon="person"
        iconColor={palette.textSecondary}
        loading={loading}
        statusFilter={statusFilter}
        onSelectStatus={onSelectStatus}
        styles={styles}
        funnelColor={palette.textMuted}
      />
      <StaffSummaryCard
        segment="active"
        count={counts.active}
        label="Hoạt động"
        icon="person"
        iconColor={palette.green}
        showFunnel
        loading={loading}
        statusFilter={statusFilter}
        onSelectStatus={onSelectStatus}
        styles={styles}
        funnelColor={palette.textMuted}
      />
      <StaffSummaryCard
        segment="inactive"
        count={counts.inactive}
        label="Không hoạt động"
        icon="ban"
        iconColor={palette.textMuted}
        showFunnel
        loading={loading}
        statusFilter={statusFilter}
        onSelectStatus={onSelectStatus}
        styles={styles}
        funnelColor={palette.textMuted}
      />
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: 8,
      marginBottom: 14,
      alignItems: 'stretch',
    },
    card: {
      flex: 1,
      minWidth: 0,
      maxWidth: '100%',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    cardSelected: {
      borderColor: c.teal,
      backgroundColor: 'rgba(45,212,191,0.08)',
    },
    cardPressed: {
      opacity: 0.92,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    iconSlot: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    funnelSpacer: {
      width: 16,
      height: 16,
    },
    countTxt: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 4,
    },
    labelTxt: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      lineHeight: 16,
    },
  });
}
