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
import type { InvoiceListRow, InvoiceRowStatus } from '../invoiceListTypes';

function statusTone(s: InvoiceRowStatus): StatusPillTone {
  if (s === 'paid') {
    return 'success';
  }
  if (s === 'pending' || s === 'partial') {
    return 'warning';
  }
  if (s === 'overdue' || s === 'cancelled') {
    return 'danger';
  }
  if (s === 'draft') {
    return 'neutral';
  }
  return 'info';
}

export type InvoiceListMobileCardProps = {
  row: InvoiceListRow;
  onPress?: () => void;
};

function InvoiceListMobileCardImpl({
  row,
  onPress,
}: InvoiceListMobileCardProps) {
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
          {row.invoiceNumber}
        </Text>
        <StatusPill tone={statusTone(row.status)} emphasized compact>
          {row.statusLabel}
        </StatusPill>
      </View>
      <View style={layout.body}>
        <Text style={layout.metaSecondary} numberOfLines={1}>
          {row.sellerName} · {row.sellerCode}
        </Text>
        <View style={layout.row}>
          <Text style={{ color: moneyColor, fontWeight: '700', fontSize: 13 }}>
            {row.totalDisplay}
          </Text>
          <Text style={[layout.meta, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
            {row.periodLabel} · {row.createdAtLabel}
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

export const InvoiceListMobileCard = React.memo(InvoiceListMobileCardImpl);
