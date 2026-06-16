import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { InventoryByProductItemApi } from '@services/warehouse/inventoryByProductApiTypes';
import { formatProductUnit } from '@mappers/warehouse/inventoryMappers';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';

export type InventoryBatchTableProps = {
  items: InventoryByProductItemApi[];
};

function locationLabel(loc: InventoryByProductItemApi['location']): string {
  if (!loc) {
    return '—';
  }
  const n = (loc.name ?? '').trim();
  const c = (loc.code ?? '').trim();
  if (n && c) {
    return `${n} (${c})`;
  }
  return n || c || '—';
}

function sourceOrderLabel(it: InventoryByProductItemApi): string {
  const po = it.inbound_order_item?.inbound_order?.purchase_order?.order_number;
  if (po && String(po).trim()) {
    return String(po).trim();
  }
  const on = it.inbound_order_item?.inbound_order?.order_number;
  if (on && String(on).trim()) {
    return String(on).trim();
  }
  return '—';
}

function conditionLabel(code: string): string {
  const c = (code ?? '').toLowerCase();
  if (c === 'good') {
    return 'Tốt';
  }
  return code || '—';
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

function BatchCard({ item, index }: { item: InventoryByProductItemApi; index: number }) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createBatchCardStyles);

  const condition = conditionLabel(item.condition);
  const isGood = (item.condition ?? '').toLowerCase() === 'good';
  const unitLabel = formatProductUnit(item.unit);

  return (
    <DetailCard
      title={item.warehouse?.name ?? `Lô #${index + 1}`}
      icon="package"
    >
      {/* Condition badge */}
      <View style={styles.conditionRow}>
        <View style={[styles.badge, isGood ? styles.badgeGood : styles.badgeNeutral]}>
          <SystemIcon
            name={isGood ? 'checkCircle' : 'info'}
            size={12}
            color={isGood ? palette.green : palette.textMuted}
          />
          <Text style={[styles.badgeTxt, isGood ? styles.badgeTxtGood : styles.badgeTxtNeutral]}>
            {condition}
          </Text>
        </View>
      </View>

      {/* 3-column quantity stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>
            {item.quantity.toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.statLab}>Tồn kho</Text>
        </View>
        <View style={[styles.statItem, styles.statItemMid]}>
          <Text style={[styles.statVal, item.reserved_quantity > 0 && styles.statValOrange]}>
            {item.reserved_quantity.toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.statLab}>Đã giữ</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, styles.statValGreen]}>
            {item.available_quantity.toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.statLab}>Có thể bán</Text>
        </View>
      </View>

      {/* Detail rows */}
      <View style={styles.divider} />
      {unitLabel ? (
        <DetailRow label="Đơn vị" value={unitLabel} />
      ) : null}
      <DetailRow
        label="Vị trí"
        value={locationLabel(item.location)}
      />
      <DetailRow
        label="Hạn sử dụng"
        value={fmtDate(item.expiry_date)}
      />
      <DetailRow
        label="Ngày nhập"
        value={fmtDate(item.received_at)}
      />
      <DetailRow
        label="Đơn hàng nguồn"
        value={sourceOrderLabel(item)}
      />
    </DetailCard>
  );
}

export function InventoryBatchTable({ items }: InventoryBatchTableProps) {
  if (items.length === 0) {
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <SystemIcon name="package" size={32} color="#9ca3af" />
        <Text style={{ marginTop: 12, fontSize: 15, fontWeight: '700', color: '#374151' }}>
          Chưa có lô hàng
        </Text>
        <Text style={{ marginTop: 4, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          Không có bản ghi tồn kho theo sản phẩm này.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {items.map((item, index) => (
        <BatchCard key={item.id} item={item} index={index} />
      ))}
    </View>
  );
}

function createBatchCardStyles(c: AppColorPalette) {
  return StyleSheet.create({
    conditionRow: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeGood: {
      backgroundColor: 'rgba(16,185,129,0.12)',
      borderColor: 'rgba(16,185,129,0.4)',
    },
    badgeNeutral: {
      backgroundColor: c.bgInput,
      borderColor: c.border,
    },
    badgeTxt: {
      fontSize: 12,
      fontWeight: '700',
    },
    badgeTxtGood: {
      color: '#34d399',
    },
    badgeTxtNeutral: {
      color: c.textMuted,
    },
    statsRow: {
      flexDirection: 'row',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      overflow: 'hidden',
      marginBottom: 12,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    statItemMid: {
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    statVal: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
    },
    statValOrange: {
      color: '#fb923c',
    },
    statValGreen: {
      color: c.green,
    },
    statLab: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 3,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginBottom: 4,
    },
  });
}
