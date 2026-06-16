import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@/src/uikits/box';
import { Text } from '@/src/uikits/text';

export type StatusBadgeTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

const toneStyles: Record<StatusBadgeTone, { bg: string; text: string }> = {
  neutral: { bg: '#E8ECEE', text: '#334155' },
  success: { bg: '#DCFCE7', text: '#166534' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
  info: { bg: '#E0F2FE', text: '#075985' },
};

export interface StatusBadgeProps {
  label: string;
  tone?: StatusBadgeTone;
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const palette = toneStyles[tone];
  return (
    <Box style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text size="xs" style={{ color: palette.text, fontWeight: '600' }}>
        {label}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
