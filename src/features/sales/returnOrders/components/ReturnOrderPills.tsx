import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { statusPillPair } from '@shared/theme/statusColors';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type {
  ReturnOrderRefundStatusUi,
  ReturnOrderRowStatus,
  ReturnOrderRowType,
} from '../returnOrderListTypes';

function returnOrderStatusSpec(
  p: AppColorPalette,
): Record<ReturnOrderRowStatus, { label: string; bg: string; color: string }> {
  return {
    pending: { label: 'Chờ duyệt', bg: p.orangeBg, color: p.orange },
    approved: { label: 'Đã duyệt', bg: p.greenBg, color: p.green },
    receiving: { label: 'Đang nhận hàng', bg: p.blueBg, color: p.blue },
    completed: { label: 'Hoàn thành', bg: p.greenBg, color: p.teal },
    rejected: { label: 'Từ chối', bg: p.redBg, color: p.red },
    cancelled: { label: 'Đã hủy', bg: p.redBg, color: p.textMuted },
    unknown: { label: '—', bg: 'rgba(148,163,184,0.2)', color: p.textMuted },
  };
}

function returnOrderTypeSpec(
  p: AppColorPalette,
): Record<ReturnOrderRowType, { label: string; bg: string; color: string }> {
  const warning = statusPillPair(p, 'warning');
  const danger = statusPillPair(p, 'danger');
  const neutral = statusPillPair(p, 'neutral');
  return {
    partial: { label: 'Trả một phần', ...warning },
    full: { label: 'Trả toàn bộ', ...danger },
    unknown: { label: '—', ...neutral },
  };
}

function returnRefundStatusSpec(
  p: AppColorPalette,
): Record<
  ReturnOrderRefundStatusUi,
  { label: string; bg: string; color: string }
> {
  return {
    pending: { label: 'Chờ hoàn tiền', bg: p.orangeBg, color: p.orange },
    processing: { label: 'Đang xử lý', bg: p.blueBg, color: p.blue },
    completed: { label: 'Đã hoàn tiền', bg: p.greenBg, color: p.green },
    cancelled: { label: 'Đã hủy', bg: p.redBg, color: p.red },
    unknown: { label: '—', bg: 'rgba(148,163,184,0.2)', color: p.textMuted },
  };
}

function Pill({
  spec,
  styles,
}: {
  spec: { label: string; bg: string; color: string };
  styles: { pill: ViewStyle; pillTxt: TextStyle };
}) {
  return (
    <View style={[styles.pill, { backgroundColor: spec.bg }]}>
      <Text style={[styles.pillTxt, { color: spec.color }]} numberOfLines={1}>
        {spec.label}
      </Text>
    </View>
  );
}

export function ReturnOrderStatusPill({
  status,
}: {
  status: ReturnOrderRowStatus;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ReturnOrderPills_styles);
  return <Pill spec={returnOrderStatusSpec(palette)[status]} styles={styles} />;
}

export function ReturnOrderTypePill({ type }: { type: ReturnOrderRowType }) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ReturnOrderPills_styles);
  return <Pill spec={returnOrderTypeSpec(palette)[type]} styles={styles} />;
}

export function ReturnRefundStatusPill({
  status,
}: {
  status: ReturnOrderRefundStatusUi;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ReturnOrderPills_styles);
  return (
    <Pill spec={returnRefundStatusSpec(palette)[status]} styles={styles} />
  );
}

function create_ReturnOrderPills_styles(_c: AppColorPalette) {
  return StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      maxWidth: 160,
    },
    pillTxt: {
      fontSize: 11,
      fontWeight: '700',
    },
  });
}
