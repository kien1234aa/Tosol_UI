import React, { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { listMobileCard } from '@shared/theme/surfaceStyles';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { createListCardLayoutStyles } from '@shared/components/ui/listMobileCard/listCardLayout';
import { joinInventoryMetaLine } from '@mappers/warehouse/inventoryMappers';
import type { InventoryLineRow } from '../myInventoryTypes';

function conditionLabelVi(code: string): string {
  const c = code.trim().toLowerCase();
  if (c === 'good') return 'Tốt';
  if (c === 'damaged') return 'Hư';
  return code.length > 0 ? code : '—';
}

function conditionTone(code: string): 'success' | 'danger' | 'neutral' {
  const c = code.trim().toLowerCase();
  if (c === 'good') return 'success';
  if (c === 'damaged') return 'danger';
  return 'neutral';
}

function formatExpiry(iso: string | null, isExpired: boolean): string | null {
  if (iso == null || !iso.trim()) return null;
  const d = new Date(iso);
  const s = Number.isNaN(d.getTime()) ? iso.trim() : d.toLocaleDateString('vi-VN');
  return isExpired ? `${s} (HH)` : s;
}

export type InventoryLineListMobileCardProps = {
  row: InventoryLineRow;
  onPress?: () => void;
};

function InventoryLineListMobileCardImpl({
  row,
  onPress,
}: InventoryLineListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const cardSurface = listMobileCard(c, mode);
  const thumbUri = (row.imageUrl ?? '').trim();
  const expiry = formatExpiry(row.expiryDate, row.isExpired);

  const metaLine = useMemo(
    () =>
      joinInventoryMetaLine([row.sku, row.warehouseName, row.locationLabel]),
    [row.sku, row.warehouseName, row.locationLabel],
  );

  const stockLine = useMemo(() => {
    const parts = [
      `KD ${row.available.toLocaleString('vi-VN')} / ${row.quantity.toLocaleString('vi-VN')}`,
    ];
    if (expiry) {
      parts.push(`HSD ${expiry}`);
    }
    return parts.join(' · ');
  }, [row.available, row.quantity, expiry]);

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
          <StatusPill
            tone={conditionTone(row.condition)}
            emphasized={false}
            compact
          >
            {conditionLabelVi(row.condition)}
          </StatusPill>
        </View>
        {metaLine ? (
          <Text style={layout.meta} numberOfLines={1}>
            {metaLine}
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

export const InventoryLineListMobileCard = React.memo(InventoryLineListMobileCardImpl);
