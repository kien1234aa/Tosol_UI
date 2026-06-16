import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet, Text, View } from 'react-native';
import type { ShipmentRowStatus } from '../shipmentListTypes';

function shipmentRowStatusSpec(
  p: AppColorPalette,
): Record<ShipmentRowStatus, { label: string; bg: string; color: string }> {
  const neutral = { bg: 'rgba(148,163,184,0.2)', color: p.textSecondary };
  const warn = { bg: p.orangeBg, color: p.orange };
  const ok = { bg: p.greenBg, color: p.green };
  const bad = { bg: p.redBg, color: p.red };
  const info = { bg: p.blueBg, color: p.blue };
  return {
    pending: { label: 'Chờ xử lý', ...neutral },
    created: { label: 'Đã tạo đơn', ...neutral },
    picking: { label: 'Đang lấy hàng', ...info },
    in_transit: { label: 'Đang vận chuyển', ...warn },
    out_for_delivery: { label: 'Đang giao hàng', ...warn },
    delivering: { label: 'Đang giao', ...warn },
    delivered: { label: 'Đã giao', ...ok },
    failed_delivery: { label: 'Giao thất bại', ...bad },
    returning: { label: 'Đang hoàn', ...warn },
    returned: { label: 'Đã hoàn', ...ok },
    cancelled: {
      label: 'Đã hủy',
      bg: 'rgba(148,163,184,0.22)',
      color: p.textMuted,
    },
    lost: { label: 'Thất lạc', ...bad },
    damaged: { label: 'Hư hỏng', ...bad },
    unknown: { label: 'Khác', ...info },
  };
}

export function ShipmentStatusPill({ status }: { status: ShipmentRowStatus }) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ShipmentStatusPill_styles);
  const t = shipmentRowStatusSpec(palette)[status];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.pillText, { color: t.color }]} numberOfLines={1}>
        {t.label}
      </Text>
    </View>
  );
}

function create_ShipmentStatusPill_styles(_c: AppColorPalette) {
  return StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      maxWidth: 140,
    },
    pillText: {
      fontSize: 11,
      fontWeight: '700',
    },
  });
}
