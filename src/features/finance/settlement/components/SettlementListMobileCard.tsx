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
import { joinSettlementMetaLine } from '@mappers/finance/settlementListMappers';
import type {
  SettlementListRow,
  SettlementRowStatus,
} from '../settlementListTypes';

function statusTone(s: SettlementRowStatus): StatusPillTone {
  if (s === 'settled') {
    return 'success';
  }
  if (s === 'confirmed') {
    return 'info';
  }
  if (s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

export type SettlementListMobileCardProps = {
  row: SettlementListRow;
  onPress?: () => void;
};

function SettlementListMobileCardImpl({
  row,
  onPress,
}: SettlementListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const cardSurface = listMobileCard(c, mode);
  const moneyColor = mode === 'dark' ? c.textLink : BRAND_HEX;

  const metaLine = useMemo(
    () =>
      joinSettlementMetaLine([
        row.sellerName,
        row.sellerCode,
        row.periodLabel,
      ]) ?? undefined,
    [row.sellerName, row.sellerCode, row.periodLabel],
  );

  const feeLine = useMemo(() => {
    const parts: string[] = [];
    if (row.codCollectedDisplay) {
      parts.push(`COD ${row.codCollectedDisplay}`);
    }
    if (row.totalFeeDisplay) {
      parts.push(`Phí ${row.totalFeeDisplay}`);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  }, [row.codCollectedDisplay, row.totalFeeDisplay]);

  const inner = (
    <>
      <View style={layout.header}>
        <Text
          style={[layout.headerTitle, { color: c.textPrimary }]}
          numberOfLines={1}
        >
          {row.settlementNumber}
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
        {(row.netDirectionLabel || row.netAmountDisplay) ? (
          <View style={layout.row}>
            {row.netDirectionLabel ? (
              <Text style={[layout.meta, { flex: 1 }]} numberOfLines={1}>
                {row.netDirectionLabel}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            {row.netAmountDisplay ? (
              <Text
                style={{ color: moneyColor, fontWeight: '700', fontSize: 13 }}
              >
                {row.netAmountDisplay}
              </Text>
            ) : null}
          </View>
        ) : null}
        {feeLine ? (
          <Text style={layout.meta} numberOfLines={1}>
            {feeLine}
          </Text>
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

export const SettlementListMobileCard = React.memo(SettlementListMobileCardImpl);
