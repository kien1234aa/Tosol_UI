import React, { useMemo } from 'react';
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
import { joinPaymentMetaLine } from '@mappers/finance/paymentListMappers';
import type { PaymentListRow, PaymentListRowStatus } from '../paymentListTypes';

function statusTone(s: PaymentListRowStatus): StatusPillTone {
  if (s === 'completed') {
    return 'success';
  }
  if (s === 'pending') {
    return 'warning';
  }
  if (s === 'failed') {
    return 'danger';
  }
  return 'neutral';
}

export type PaymentListMobileCardProps = {
  row: PaymentListRow;
  onPress?: () => void;
};

function PaymentListMobileCardImpl({
  row,
  onPress,
}: PaymentListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const cardSurface = listMobileCard(c, mode);
  const moneyColor = mode === 'dark' ? c.textLink : BRAND_HEX;
  const title = row.orderRef ?? row.paymentCode;

  const metaLine = useMemo(
    () =>
      joinPaymentMetaLine([
        row.typeLabel,
        row.methodLabel,
        row.customerName,
      ]) ?? undefined,
    [row.typeLabel, row.methodLabel, row.customerName],
  );

  const inner = (
    <>
      <View style={layout.header}>
        <Text
          style={[layout.headerTitle, { color: c.textPrimary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <StatusPill tone={statusTone(row.status)} emphasized compact>
          {row.statusLabel}
        </StatusPill>
      </View>
      <View style={layout.body}>
        {metaLine ? (
          <Text style={layout.metaSecondary} numberOfLines={2}>
            {metaLine}
          </Text>
        ) : null}
        {(row.amountDisplay || row.paidDateLabel) ? (
          <View style={layout.row}>
            {row.amountDisplay ? (
              <Text
                style={{ color: moneyColor, fontWeight: '700', fontSize: 13 }}
              >
                {row.amountDisplay}
              </Text>
            ) : (
              <View />
            )}
            {row.paidDateLabel ? (
              <Text
                style={[layout.meta, { flex: 1, textAlign: 'right' }]}
                numberOfLines={1}
              >
                {row.paidDateLabel}
              </Text>
            ) : null}
          </View>
        ) : null}
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

export const PaymentListMobileCard = React.memo(PaymentListMobileCardImpl);
