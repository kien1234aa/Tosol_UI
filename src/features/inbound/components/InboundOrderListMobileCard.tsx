import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { listMobileCard } from '@shared/theme/surfaceStyles';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import {
  StatusPill,
  type StatusPillTone,
} from '@shared/components/ui/StatusPill';
import { createListCardLayoutStyles } from '@shared/components/ui/listMobileCard/listCardLayout';
import type {
  InboundOrderListRow,
  InboundOrderRowStatus,
} from '../inboundOrderTypes';

function statusTone(s: InboundOrderRowStatus): StatusPillTone {
  if (s === 'completed') {
    return 'success';
  }
  if (s === 'receiving') {
    return 'info';
  }
  if (s === 'pending') {
    return 'warning';
  }
  if (s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

export type InboundOrderListMobileCardProps = {
  row: InboundOrderListRow;
  onPress?: () => void;
};

function InboundOrderListMobileCardImpl({
  row,
  onPress,
}: InboundOrderListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const { t } = useTranslation();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const cardSurface = listMobileCard(c, mode);

  const metaLine = [row.linkedOrderLabel, row.warehouseName, row.sellerName]
    .filter(Boolean)
    .join(' · ');
  const progressLine = `Nhận ${row.receiveProgressPct}% · ${row.qtyReceivedLabel}`;

  const moreText =
    row.moreProductsCount > 0
      ? t('common.moreProducts', { count: row.moreProductsCount })
      : null;
  const second = row.productSecondLabel?.trim() ?? '';
  let extraProductLine: string | null = null;
  if (second.length > 0 && moreText != null) {
    extraProductLine = `${second} · ${moreText}`;
  } else if (second.length > 0) {
    extraProductLine = second;
  } else if (moreText != null) {
    extraProductLine = moreText;
  }

  const inner = (
    <>
      <View style={layout.header}>
        <Text
          style={[layout.headerTitle, { color: c.textPrimary }]}
          numberOfLines={1}
        >
          {row.orderNumber}
        </Text>
        <StatusPill tone={statusTone(row.rowStatus)} emphasized compact>
          {row.statusLabel}
        </StatusPill>
      </View>
      <View style={layout.body}>
        <View style={layout.row}>
          {row.productThumb ? (
            <Image source={{ uri: row.productThumb }} style={layout.thumb} />
          ) : (
            <View style={layout.thumb}>
              <SystemIcon name="download" size={18} color={c.textMuted} />
            </View>
          )}
          <Text
            style={[layout.metaSecondary, { flex: 1, fontWeight: '600' }]}
            numberOfLines={2}
          >
            {row.productLabel}
          </Text>
        </View>
        {extraProductLine != null ? (
          <Text style={layout.meta} numberOfLines={1}>
            {extraProductLine}
          </Text>
        ) : null}
        {metaLine.length > 0 ? (
          <Text style={layout.meta} numberOfLines={1}>
            {metaLine}
          </Text>
        ) : null}
        <Text style={[layout.metaSecondary, { fontWeight: '600' }]} numberOfLines={1}>
          {progressLine}
        </Text>
        <Text style={layout.meta} numberOfLines={1}>
          {row.createdAtLabel}
        </Text>
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

export const InboundOrderListMobileCard = React.memo(InboundOrderListMobileCardImpl);
