import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BRAND_HEX } from '@shared/theme/designTokens';
import { listMobileCard } from '@shared/theme/surfaceStyles';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  StatusPill,
  type StatusPillTone,
} from '@shared/components/ui/StatusPill';
import { createListCardLayoutStyles } from '@shared/components/ui/listMobileCard/listCardLayout';
import type {
  GatewayTxnListRow,
  GatewayTxnRowStatus,
} from '../gatewayTransactionListTypes';

function statusTone(s: GatewayTxnRowStatus): StatusPillTone {
  if (s === 'completed') {
    return 'success';
  }
  if (s === 'pending') {
    return 'warning';
  }
  if (s === 'processing') {
    return 'info';
  }
  if (s === 'failed') {
    return 'danger';
  }
  return 'neutral';
}

export type GatewayTxnListMobileCardProps = {
  row: GatewayTxnListRow;
  onPress?: () => void;
};

function GatewayTxnListMobileCardImpl({
  row,
  onPress,
}: GatewayTxnListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const cardSurface = listMobileCard(c, mode);
  const moneyColor = mode === 'dark' ? c.textLink : BRAND_HEX;

  const inner = (
    <>
      <View style={layout.header}>
        <Text
          style={[layout.headerTitle, { color: c.textPrimary }]}
          numberOfLines={1}
        >
          {row.providerName}
        </Text>
        <StatusPill tone={statusTone(row.status)} emphasized compact>
          {row.statusLabel}
        </StatusPill>
      </View>
      <View style={layout.body}>
        <Text style={layout.metaSecondary} numberOfLines={1}>
          {row.typeLabel} · Đơn {row.orderRef}
        </Text>
        <View style={layout.row}>
          <Text style={{ color: moneyColor, fontWeight: '700', fontSize: 13 }}>
            {row.amountDisplay}
          </Text>
          <Text style={[layout.meta, { flex: 1, textAlign: 'right' }]}>
            {row.createdLabel}
          </Text>
        </View>
      </View>
    </>
  );

  const shell = [layout.card, cardSurface];

  if (onPress != null) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [shell, pressed && { opacity: 0.96 }]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={shell}>{inner}</View>;
}

export const GatewayTxnListMobileCard = React.memo(GatewayTxnListMobileCardImpl);
