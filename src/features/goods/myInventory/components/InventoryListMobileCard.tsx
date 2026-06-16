import React, { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { listMobileCard } from '@shared/theme/surfaceStyles';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { createListCardLayoutStyles } from '@shared/components/ui/listMobileCard/listCardLayout';
import { joinInventoryMetaLine } from '@mappers/warehouse/inventoryMappers';
import type { InventoryRow } from '../myInventoryTypes';

function isLowStock(row: InventoryRow): boolean {
  const m = row.minStock;
  if (m == null || !Number.isFinite(m)) {
    return false;
  }
  return row.onHand <= m;
}

export type InventoryListMobileCardProps = {
  row: InventoryRow;
  onPress?: () => void;
};

function InventoryListMobileCardImpl({
  row,
  onPress,
}: InventoryListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const cardSurface = listMobileCard(c, mode);
  const low = isLowStock(row);
  const thumbUri = (row.imageUrl ?? '').trim();
  const avail = row.onHand - row.reserved;

  const skuLine = useMemo(
    () => joinInventoryMetaLine([row.sku, row.unit]),
    [row.sku, row.unit],
  );

  const stockLine = useMemo(() => {
    const parts = [`Tồn ${row.onHand.toLocaleString('vi-VN')}`];
    if (row.reserved > 0) {
      parts.push(`Giữ ${row.reserved.toLocaleString('vi-VN')}`);
    }
    parts.push(`KD ${avail.toLocaleString('vi-VN')}`);
    return parts.join(' · ');
  }, [row.onHand, row.reserved, avail]);

  const inner = (
    <View style={[layout.row, layout.bodyTight]}>
      <View style={layout.thumb}>
        {thumbUri.length > 0 ? (
          <Image source={{ uri: thumbUri }} style={layout.thumbImg} resizeMode="cover" />
        ) : (
          <SystemIcon name="package" size={18} color={c.textMuted} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={layout.row}>
          <Text
            style={[layout.headerTitle, { color: c.textPrimary, flex: 1 }]}
            numberOfLines={1}
          >
            {row.name}
          </Text>
          <StatusPill tone={low ? 'warning' : 'success'} emphasized={false} compact>
            {low ? 'Sắp hết' : 'Ổn'}
          </StatusPill>
        </View>
        {skuLine ? (
          <Text style={layout.meta} numberOfLines={1}>
            {skuLine}
          </Text>
        ) : null}
        <Text style={layout.metaSecondary} numberOfLines={1}>
          {stockLine}
        </Text>
      </View>
    </View>
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

export const InventoryListMobileCard = React.memo(InventoryListMobileCardImpl);
